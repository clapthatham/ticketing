import { Message } from 'node-nats-streaming';
import mongoose from 'mongoose';
import { TicketUpdatedEvent } from "@clapticketing/common";
import { TicketUpdatedListener } from "../ticket-updated-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { Ticket } from '../../../models/ticket';

const setup = async () => {
    //creates an instance of the listener
    const listener = new TicketUpdatedListener(natsWrapper.client);

    //create the initial ticket
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 10
    });
    await ticket.save();

    //create the fake data event
    // @ts-ignore
    const data: TicketUpdatedEvent['data'] = {
        id: ticket.id,
        version: ticket.version + 1,
        title: 'theatre',
        price: 30,
        userId: 'wrfeeg'
    };

    //create a fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    return { msg, data, ticket, listener };
};

it('finds, updates and saves a ticket', async () => {
    const { listener, data, ticket, msg } = await setup();

    //call the onMessage function with the data object + message object
    await listener.onMessage(data, msg);

    //write assertions to make sure a ticket was created

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket!.title).toEqual(data.title);
    expect(updatedTicket!.price).toEqual(data.price);
    expect(updatedTicket!.version).toEqual(data.version);
});

it('acks the message', async () => {
    const { listener, data, msg } = await setup();

    //call the onMessage function with the data object + message object

    await listener.onMessage(data, msg);

    //write assertions to make sure ack function is called
    expect(msg.ack).toHaveBeenCalled();
});

it('does not call the ack if the event has a skipped version number', async () => {
    const { listener, data, ticket, msg } = await setup();

    data.version = 10;

    try {
        await listener.onMessage(data, msg);
    } catch (err) {
    }
    
    expect(msg.ack).not.toHaveBeenCalled();
});