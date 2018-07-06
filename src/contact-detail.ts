import { ContactViewed, ContactUpdated } from './message';
import { WebAPI } from './web-api';
import { autoinject } from "aurelia-framework";
import { areEqual } from 'utility';
import { EventAggregator } from 'aurelia-event-aggregator';
import { ValidationRules, ValidationController, validateTrigger, Validator, ValidationControllerFactory } from 'aurelia-validation';
import { RouteConfig } from 'aurelia-router';

interface Contact {
  firstName : string;
  lastName : string;
  email : string;
}

@autoinject
export class ContactDetail {

  routeConfig : RouteConfig;
  contact: Contact;
  originalContact : Contact;
  canSave : boolean = false;
  validationCtrl : ValidationController;
  
  constructor(private api : WebAPI, 
    private evt : EventAggregator,
    private validator: Validator,
    private controllerFactory: ValidationControllerFactory) {
    
    this.validationCtrl = this.controllerFactory.createForCurrentScope(validator);
    this.validationCtrl.validateTrigger = validateTrigger.changeOrBlur;
    this.validationCtrl.subscribe(event => this.validateForm());
  }

  validateForm() {
    this.validator.validateObject(this.contact)
      .then(results => this.canSave = results.every(result => result.valid));
  }

  activate(params, routeConfig) {
    this.routeConfig = routeConfig;

    return this.api.getContactDetails(params.id).then(contact => {
      this.setContact(contact);
      this.evt.publish(new ContactViewed(this.contact));
    });
  }

  save() {
    this.validationCtrl.validate().then(result => {
      if (result.valid) {
        this.update();
      }
    });
  }

  update() {
    this.api.saveContact(this.contact).then(contact => {
      this.setContact(contact);
      this.evt.publish(new ContactUpdated(this.contact));
    });
  }

  setContact(contact) {
    this.contact = <Contact>contact;
    this.routeConfig.navModel.setTitle(this.contact.firstName);
    this.originalContact = JSON.parse(JSON.stringify(this.contact));

    this.setupValidation();
  }

  setupValidation() {
    ValidationRules
      .ensure('firstName')
        .displayName('Nome')
        .required()
        .withMessage(`\${$displayName} é obrigatório`)
        .minLength(3)
        .withMessage(`\${$displayName} deve ter no mínimo 3 caracteres`)
      .ensure('lastName')
        .displayName('Sobrenome')
        .required()
        .withMessage(`\${$displayName} é obrigatório`)
        .minLength(3)
        .withMessage(`\${$displayName} deve ter no mínimo 3 caracteres`)
        .on(this.contact);
  }

  canDeactivate() {
    if (!areEqual(this.originalContact, this.contact)) {
      let result = confirm('Sair e descartar alterações?');

      if (!result) {
        this.evt.publish(new ContactViewed(this.contact));
      }

      return result;
    }

    return true;
  }

}
