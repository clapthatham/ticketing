import { Publisher, OrderCancelledEvent, Subjects } from "@clapticketing/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}