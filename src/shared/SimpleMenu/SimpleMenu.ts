import { Scene } from 'phaser'

export class SimpleMenuScene extends Scene {
  private buttons: Phaser.GameObjects.Text[] = []
  private availableY = 0
  public closable = false

  static key = 'simpleMenu'
  static EVENTS = {
    ON_MENU_OPENED: 'ON_MENU_OPENED',
    ON_MENU_CLOSED: 'ON_MENU_CLOSED',
  }
  constructor() {
    super('simpleMenu')
  }
  preload() {}
  create() {
    const bg = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000)
    bg.setScrollFactor(0, 0)
    bg.setOrigin(0, 0)

    this.availableY = this.scale.height / 2

    this.input.keyboard.on('keydown-ESC', () => {
      if (this.closable && this.scene.isVisible()) {
        this.scene.setVisible(false)
        this.events.emit(SimpleMenuScene.EVENTS.ON_MENU_CLOSED)
      } else {
        this.scene.setVisible(true)
        this.events.emit(SimpleMenuScene.EVENTS.ON_MENU_OPENED)
      }
    })
  }
  toggleMenu(value?: boolean) {
    this.scene.setVisible(value ?? !this.scene.isVisible())
  }
  addButton(label: string, onClick: () => void) {
    const btn = this.add
      .text(this.scale.width / 2, this.availableY, label, {
        fontSize: '32px',
        color: 'rgba(250, 250, 250, 1)',
      })
      .setScrollFactor(0, 0)
    btn.setOrigin(0.5, 0.5)
    btn.setInteractive()
    btn.on('pointerdown', onClick)

    this.buttons.push(btn)

    this.availableY = btn.y + btn.height

    return btn
  }
  setEnableToButton(btn: Phaser.GameObjects.Text, enabled: boolean) {
    if (enabled) {
      btn.style.color = 'rgba(250, 250, 250, 1)'
      btn.setInteractive()
    } else {
      btn.style.color = 'rgba(250, 250, 250, 0.3)'
      btn.removeInteractive()
    }
    btn.updateText()
  }
}
