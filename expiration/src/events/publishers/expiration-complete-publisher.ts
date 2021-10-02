import { Subjects, Publisher, ExpirationCompleteEvent } from '@clapticketing/common';
  
  export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
    subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
  }
  