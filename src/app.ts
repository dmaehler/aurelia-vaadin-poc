import { WebAPI } from './web-api';
import { PLATFORM } from 'aurelia-pal';
import {Router, RouterConfiguration} from 'aurelia-router';

export class App {
  
  router: Router;

  constructor(private api : WebAPI) { }

  configureRouter(config : RouterConfiguration, router : Router) {
    config.title = 'Contatos';
    config.map([
      {
        route: '',
        moduleId: PLATFORM.moduleName('no-selection'),
        title: 'Selecionar'
      }, {
        route: 'contacts/:id',
        moduleId: PLATFORM.moduleName('contact-detail'),
        name : 'contacts'
      }
    ]);

    this.router = router;
  }

}
