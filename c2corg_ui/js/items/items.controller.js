export default class ItemsController {
  constructor(ItemsService) {
    'ngInject';

    this.items = [
      {
        name: ItemsService.toto()
      },
      {
        name: 'tata'
      }
    ];
  }
}

