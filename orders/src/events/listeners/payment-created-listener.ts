import { Subjects, Listener, PaymentCreatedEvent, OrderStatus } from '@clapticketing/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import { Order } from '../../models/order';

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
    subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
        const order = await Order.findById(data.orderId);

        if (!order) {
            throw new Error('Order not found');
        }

        //some risk here that other services won't know final Order version for subsequent updates
        order.set({
            status: OrderStatus.Complete
        });
        await order.save();

        msg.ack();
    }
}