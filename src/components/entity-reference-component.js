import * as Const from '../const';
import Component from '../component';

export default class EntityReferenceComponent extends Component {
  constructor(typeId = '', entityId = '') {
    super();

    this.typeId = typeId;
    this.entityId = entityId;
  }

  get isEmpty() {
    return !this.entityId;
  }

  empty() {
    this.entityId = '';
  }

  clone() {
    return new EntityReferenceComponent(this.typeId, this.entityId);
  }

  static isNotEmpty(component) {
    return !component.isEmpty;
  }

  static isInventoryUseSlot(component) {
    return component.typeId === Const.InventorySlot.Use;
  }

  static isEmptyBackpackSlot(component) {
    return component.typeId === Const.InventorySlot.Backpack && component.isEmpty;
  }

  static isEmptyStockSlot(component) {
    return component.typeId === Const.MerchantSlot.Stock && component.isEmpty;
  }

  static isHotbarSlot(component) {
    return component.typeId === Const.InventorySlot.Hotbar;
  }

  static isHand1Slot(component) {
    return component.typeId === Const.InventorySlot.Hand1;
  }

  static isMemorySlot(component) {
    return component.typeId === Const.MagicSpellSlot.Memory;
  }

  static isMerchantStockSlot(component) {
    return component.typeId === Const.MerchantSlot.Stock;
  }
}


