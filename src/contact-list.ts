import { ContactViewed, ContactUpdated } from './message';
import { inject } from 'aurelia-framework';
import { WebAPI } from './web-api';
import { EventAggregator } from 'aurelia-event-aggregator';

@inject(WebAPI, EventAggregator)
export class ContactList {

  contacts;
  selectedId = 0;

  constructor(private api : WebAPI, private evt : EventAggregator) { 
    this.evt.subscribe(ContactViewed, msg => this.select(msg.contact));
    this.evt.subscribe(ContactUpdated, msg => {
      let id = msg.contact.id;
      let found = this.contacts.find(contact => contact.id == id);
      Object.assign(found, msg.contact);
    })
  }

  created() {
    this.api.getContactList().then(contacts => this.contacts = contacts);
  }

  select(contact) {
    this.selectedId = contact.id;
    return true;
  }
}
