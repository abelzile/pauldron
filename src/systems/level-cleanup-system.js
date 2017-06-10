import * as EntityFinders from '../entity-finders';
import EntityReferenceComponent from '../components/entity-reference-component';
import System from '../system';

export default class LevelCleanupSystem extends System {
  constructor(renderer, entityManager) {
    super();
    this._renderer = renderer;
    this._entityManager = entityManager;
  }

  checkProcessing() {
    return true;
  }

  processEntities(gameTime, entities) {
    const deleteds = entities.filter(EntityFinders.isDeleted);
    for (const deleted of deleteds) {
      const referenced = EntityFinders.findReferencedIn(entities, deleted.getAll('EntityReferenceComponent'));
      this._entityManager.removeAll(referenced);
    }
    this._entityManager.removeAll(deleteds);
  }
}
