import { Subjects, Publisher, PaymentCreatedEvent } from '@clapticketing/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}