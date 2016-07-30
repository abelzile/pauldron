import * as Const from '../const';
import * as EntityFinders from '../entity-finders';
import _ from 'lodash';
import DialogRenderSystem from './dialog-render-system';
import Pixi from 'pixi.js';


export default class AbilitiesRenderSystem extends DialogRenderSystem {

  constructor(pixiContainer, renderer, entityManager) {

    super(pixiContainer, renderer);

    this._entityManager = entityManager;

    this._headingGrid = undefined;
    this._skillSlotGrid = undefined;
    this._skillPointsHeading = undefined;
    this._redrawMemorizedSkill = false;
    this._redrawLearnedSkills = false;

  }

  checkProcessing() {
    return true;
  }

  initialize(entities) {

    const gui = EntityFinders.findAbilitiesGui(entities);

    this.drawDialogHeader(gui.get('DialogHeaderComponent'));

    const headings = gui.getAllKeyed('BitmapTextComponent', 'id');

    this._drawHeadings(headings);

    let startY = 45;
    this._headingGrid = this._createGrid(startY);

    startY += 10;
    this._skillSlotGrid = this._createGrid(startY);

    const hero = this._entityManager.heroEntity;
    const heroCharClass = this._getHeroCharacterClass(hero, entities);
    const stats = hero.getAllKeyed('StatisticComponent', 'name');
    const skillPoints = stats[Const.Statistic.SkillPoints].currentValue;

    this._updateSkillPointsHeading(skillPoints);

    const skillGroupRefs = heroCharClass.getAll('EntityReferenceComponent', c => c.entityId && c.typeId === 'skill_group');
    const skillGroups = _.map(skillGroupRefs, c => EntityFinders.findById(entities, c.entityId));

    const heroSkillRefs = hero.getAll('EntityReferenceComponent', c => c.entityId && c.typeId === 'skill');
    const heroSkills = _.map(heroSkillRefs, c => EntityFinders.findById(entities, c.entityId));

    const addBtns = gui.getAll('SpriteComponent', c => c.id && c.id.startsWith('add_btn_'));

    const skillGroupMax = skillGroups.length;
    const yMax = this._headingGrid.length;
    const xMax = this._headingGrid[0].length;

    let j = 0;

    for (let y = 0, i = 0; i < skillGroupMax && y < yMax; ++y) {

      for (let x = 0; x < xMax; ++x) {

        i = y * xMax + x;

        if (i >= skillGroupMax) { break; }

        const skillGroup = skillGroups[i];

        const heading = skillGroup.get('BitmapTextComponent');

        this.pixiContainer.addChild(heading.sprite);

        let headingPos = this._headingGrid[y][x];
        heading.sprite.position.x = headingPos.x;
        heading.sprite.position.y = headingPos.y;

        let skillPos = this._skillSlotGrid[y][x];

        const skillRefs = skillGroup.getAll('EntityReferenceComponent', c => c.typeId === 'skill');

        let skillPosX = skillPos.x;

        for (const skillRef of skillRefs) {

          const skill = EntityFinders.findById(entities, skillRef.entityId);

          const icon = skill.get('InventoryIconComponent');

          const sprite = icon.sprite;
          this.pixiContainer.addChild(sprite);
          sprite.position.x = skillPosX + 2;
          sprite.position.y = skillPos.y + 2;
          sprite.interactive = true;
          sprite._skillId = skill.id;
          sprite
            .on('mouseover', (eventData) => { this._onSkillMouseOver(eventData); })
            .on('mouseout', (eventData) => { this._onSkillMouseOut(); })
            ;

          if (!sprite.filters) {
            sprite.filters = [ new Pixi.filters.GrayFilter() ];
          } else {
            //TODO: ensure filter 0 is GrayFilter.
          }

          let isLearned = false;

          if (skill.has('MagicSpellComponent')) {

            const heroMagicSpellSkills = _.filter(heroSkills, e => e.has('MagicSpellComponent'));

            isLearned = _.some(heroMagicSpellSkills, e => e.get('MagicSpellComponent').magicSpellType === skill.get('MagicSpellComponent').magicSpellType);

            if (isLearned) {

              sprite.alpha = 1;
              sprite.filters[0].gray = 0;
              sprite.buttonMode = true;
              sprite.on('click', (eventData) => { this._onSkillClick(eventData); })

            } else {

              sprite.alpha = .8;
              sprite.filters[0].gray = 1;
              sprite.buttonMode = false;
              sprite.removeAllListeners('click');

            }

          }

          //TODO: check other skills that aren't magic spells

          const learnSprite = addBtns[j].sprite;
          this.pixiContainer.addChild(learnSprite);
          learnSprite.position.x = sprite.position.x + (sprite.width - learnSprite.width);
          learnSprite.position.y = sprite.position.y + (sprite.height - learnSprite.height);
          learnSprite.interactive = true;
          learnSprite.buttonMode = true;
          learnSprite.visible = !isLearned && skillPoints > 0;
          learnSprite._skillId = skill.id;
          learnSprite.on('click', (eventData) => this._onLearnSkillClick(eventData));

          ++j;

          skillPosX = skillPos.x + (i * 24);

        }

      }

    }

    const memorizedCursor = gui.get('SpriteComponent', c => c.id === 'memorized_cursor');
    this.pixiContainer.addChild(memorizedCursor.sprite);
    memorizedCursor.sprite.visible = false;

    const borderG = gui.get('GraphicsComponent').graphics;
    this.pixiContainer.addChild(borderG);

    this._redrawMemorizedSkill = true;

  }

  processEntities(gameTime, entities) {

    if (this._redrawLearnedSkills) {

      this._redrawLearnedSkills = false;

      const hero = this._entityManager.heroEntity;
      const heroCharClass = this._getHeroCharacterClass(hero, entities);
      const stats = hero.getAllKeyed('StatisticComponent', 'name');
      const skillPoints = stats[Const.Statistic.SkillPoints].currentValue;

      this._updateSkillPointsHeading(skillPoints);

      const skillGroupRefs = heroCharClass.getAll('EntityReferenceComponent', c => c.entityId && c.typeId === 'skill_group');
      const skillGroups = _.map(skillGroupRefs, c => EntityFinders.findById(entities, c.entityId));

      const heroSkillRefs = hero.getAll('EntityReferenceComponent', c => c.entityId && c.typeId === 'skill');
      const heroSkills = _.map(heroSkillRefs, c => EntityFinders.findById(entities, c.entityId));

      const gui = EntityFinders.findAbilitiesGui(entities);
      const addBtns = gui.getAll('SpriteComponent', c => c.id && c.id.startsWith('add_btn_'));

      let i = 0;

      for (const skillGroup of skillGroups) {

        const skillRefs = skillGroup.getAll('EntityReferenceComponent', c => c.typeId === 'skill');

        for (const skillRef of skillRefs) {

          const skill = EntityFinders.findById(entities, skillRef.entityId);
          const icon = skill.get('InventoryIconComponent');
          const sprite = icon.sprite;

          let isLearned = false;

          if (skill.has('MagicSpellComponent')) {

            const heroMagicSpellSkills = _.filter(heroSkills, e => e.has('MagicSpellComponent'));

            isLearned = _.some(heroMagicSpellSkills, e => e.get('MagicSpellComponent').magicSpellType === skill.get('MagicSpellComponent').magicSpellType);

            if (isLearned) {

              sprite.alpha = 1;
              sprite.filters[0].gray = 0;
              sprite.buttonMode = true;
              sprite.on('click', (eventData) => { this._onSkillClick(eventData); })

            } else {

              sprite.alpha = .8;
              sprite.filters[0].gray = 1;
              sprite.buttonMode = false;
              sprite.removeAllListeners('click');

            }

          }

          //TODO: check other skills that aren't magic spells

          const learnSprite = addBtns[i].sprite;
          learnSprite.interactive = true;
          learnSprite.buttonMode = true;
          learnSprite.visible = !isLearned && skillPoints > 0;
          learnSprite._skillId = skill.id;
          learnSprite.on('click', (eventData) => this._onLearnSkillClick(eventData));

          ++i;

        }

      }

    }

    if (this._redrawMemorizedSkill) {

      this._redrawMemorizedSkill = false;

      const hero = this._entityManager.heroEntity;
      const heroCharClass = this._getHeroCharacterClass(hero, entities);
      const memory = hero.get('EntityReferenceComponent', c => c.typeId === Const.MagicSpellSlot.Memory);

      const skillGroupRefs = heroCharClass.getAll('EntityReferenceComponent', c => c.entityId && c.typeId === 'skill_group');
      const skillGroups = _.map(skillGroupRefs, c => EntityFinders.findById(entities, c.entityId));

      let done = false;

      for (const skillGroup of skillGroups) {

        if (done) { break; }

        const skillRefs = skillGroup.getAll('EntityReferenceComponent', c => c.typeId === 'skill');

        for (const skillRef of skillRefs) {

          if (skillRef.entityId !== memory.entityId) { continue; }

          const skill = EntityFinders.findById(entities, skillRef.entityId);
          const icon = skill.get('InventoryIconComponent');
          const sprite = icon.sprite;

          const gui = EntityFinders.findAbilitiesGui(entities);

          const memorizedCursor = gui.get('SpriteComponent', c => c.id === 'memorized_cursor');
          memorizedCursor.sprite.position.x = sprite.position.x - 2;
          memorizedCursor.sprite.position.y = sprite.position.y - 2;
          memorizedCursor.sprite.visible = true;

          done = true;

          break;

        }

      }

    }

  }

  unload(entities) {
  }

  _onLearnSkillClick(eventData) {

    this.emit('abilities-render-system.learn-skill', eventData.target._skillId);

    this._redrawLearnedSkills = true;

  }

  _onSkillMouseOver(eventData) {
    this.emit('abilities-render-system.set-current-skill', eventData.target._skillId);
  }

  _onSkillMouseOut() {
    this.emit('abilities-render-system.set-current-skill', '');
  }

  _onSkillClick(eventData) {

    this.emit('abilities-render-system.set-memorized-skill', eventData.target._skillId);

    this._redrawMemorizedSkill = true;

  }

  _createGrid(startY) {

    let posY = startY;

    const grid = [];

    for (let y = 0; y < 5; ++y) {

      const row = [];
      let posX = 110;

      for (let x = 0; x < 2; ++x) {

        row.push({ x: posX, y: posY });
        posX += 104; // ((20 + 2) * 4) + 16; ((slot size + hspacing) * num of slots) + more spacing;

      }

      grid.push(row);

      posY += 32; // arbitrary. whatever looks good.

    }

    return grid;

  }

  _drawHeadings(headings) {

    const screenWidth = this.renderer.width;
    const screenHeight = this.renderer.height;
    const scale = this.renderer.globalScale;
    const halfScreenWidth = screenWidth / 2;

    const attributesHeading = headings['attributes'].sprite;
    this.pixiContainer.addChild(attributesHeading);
    attributesHeading.align = 'center';
    attributesHeading.position.x = 10;
    attributesHeading.position.y = 30;

    const skillsHeading = headings['skills'].sprite;
    this.pixiContainer.addChild(skillsHeading);
    skillsHeading.align = 'center';
    skillsHeading.position.x = (halfScreenWidth - (skillsHeading.width * scale / 2)) / scale;
    skillsHeading.position.y = 30;

    const skillPointsHeading = headings['skill_points'].sprite;
    this.pixiContainer.addChild(skillPointsHeading);
    skillPointsHeading.align = 'center';
    skillPointsHeading.position.x = (halfScreenWidth - (skillPointsHeading.width * scale / 2)) / scale;
    skillPointsHeading.position.y = 16;

    this._skillPointsHeading = skillPointsHeading;

  }

  _updateSkillPointsHeading(skillPoints) {

    const screenWidth = this.renderer.width;
    const screenHeight = this.renderer.height;
    const scale = this.renderer.globalScale;
    const halfScreenWidth = screenWidth / 2;

    let msg = 'No skill points to spend.';
    let color = 0xbbbbbb;

    if (skillPoints > 0) {
      if (skillPoints === 1) {
        msg = '1 skill point to spend!';
      } else {
        msg = skillPoints + ' skill points to spend!';
      }
      color = 0xf0e060;
    }

    this._skillPointsHeading.tint = color;
    this._skillPointsHeading.text = msg;
    this._skillPointsHeading.position.x = (halfScreenWidth - (this._skillPointsHeading.width * scale / 2)) / scale;

  }

  _getHeroCharacterClass(hero, entities) {
    return _.find(EntityFinders.findCharacterClasses(entities), c => c.get('CharacterClassComponent').typeId === hero.get('CharacterClassComponent').typeId);
  }

}