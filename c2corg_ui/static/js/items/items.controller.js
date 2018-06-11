export default class ItemsController {
  constructor(ItemsService) {
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

ItemsController.$inject = ['ItemsService'];
