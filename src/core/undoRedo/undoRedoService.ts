import { FabricCanvas, IFabricCanvas } from '@/core/canvas/fabricCanvas'
import { UndoRedo } from '@/core/undoRedo/undoRedo'
import { KeybindingService, IKeybindingService } from '@/core/keybinding/keybindingService'
import { EventbusService, IEventbusService } from '@/core/eventbus/eventbusService'
import { createDecorator } from '@/core/instantiation/instantiation'
import { IWorkspacesService, WorkspacesService } from '@/core/workspaces/workspacesService'

export const IUndoRedoService = createDecorator<UndoRedoService>('undoRedoService')

export class UndoRedoService {
  private pageId: string

  private undoRedos: Map<
    string,
    {
      instantiation: UndoRedo
      lastState: string | undefined
    }
  > = new Map()

  constructor(
    @IFabricCanvas private readonly canvas: FabricCanvas,
    @IKeybindingService readonly keybinding: KeybindingService,
    @IEventbusService private readonly eventbus: EventbusService,
    @IWorkspacesService private readonly workspacesService: WorkspacesService,
  ) {
    keybinding.bind('mod+z', this.undo.bind(this))
    keybinding.bind(['mod+y', 'mod+shift+z'], this.redo.bind(this))

    canvas.on('object:modified', this.saveState.bind(this))

    this.pageId = this.workspacesService.getCurrentWorkspaceId()

    this.initWorkspace()
  }

  private getUndoRedo() {
    return this.undoRedos.get(this.pageId)
  }

  public push(state: any) {
    const undoRedo = this.getUndoRedo()
    if (!undoRedo) return

    undoRedo.instantiation.push(state)
    this.eventbus.emit('undoRedoStackChange')
  }

  public redo() {
    const undoRedo = this.getUndoRedo()
    if (!undoRedo) return

    if (!undoRedo.instantiation.canRedo) return

    undoRedo.lastState = undoRedo.instantiation.redo(undoRedo.lastState)
    if (undoRedo.lastState) {
      this.loadJson(undoRedo.lastState)
      this.eventbus.emit('undoRedoStackChange')
    }
    return undoRedo.lastState
  }

  public undo() {
    const undoRedo = this.getUndoRedo()
    if (!undoRedo) return

    if (!undoRedo.instantiation.canUndo) return

    undoRedo.lastState = undoRedo.instantiation.undo(undoRedo.lastState)
    if (undoRedo.lastState) {
      this.loadJson(undoRedo.lastState)
      this.eventbus.emit('undoRedoStackChange')
    }
    return undoRedo.lastState
  }

  public reset() {
    const undoRedo = this.getUndoRedo()
    if (!undoRedo) return

    undoRedo.instantiation.reset()
    this.eventbus.emit('undoRedoStackChange')
  }

  private async loadJson(json: string) {
    const undoRedo = this.getUndoRedo()
    if (!undoRedo) return
    const { instantiation } = undoRedo

    try {
      instantiation.pause()
      await this.canvas.loadFromJSON(json)
    } finally {
      this.canvas.renderAll()
      instantiation.resume()
    }
  }

  private getJson() {
    return this.canvas.toObject()
  }

  // todo jsondiffpatch https://github.com/benjamine/jsondiffpatch
  public saveState() {
    const undoRedo = this.getUndoRedo()
    if (!undoRedo) return

    if (!undoRedo.instantiation.isTracking) return
    this.push(undoRedo.lastState)
    undoRedo.lastState = this.getJson()
  }

  // 工作区 | 页面管理
  private initWorkspace() {
    this.workspacesService.getAllWorkspaces().forEach((workspace) => {
      this.undoRedos.set(workspace.id, {
        instantiation: new UndoRedo(),
        lastState:
          this.pageId === this.workspacesService.getCurrentWorkspaceId()
            ? this.getJson()
            : undefined,
      })
    })
    this.eventbus.on('workspaceAdd', (id) => {
      this.undoRedos.set(id, {
        instantiation: new UndoRedo(),
        lastState: undefined,
      })
    })
    this.eventbus.on('workspaceRemove', (id) => {
      this.undoRedos.delete(id)
    })
    this.eventbus.on('workspaceChangeAfter', (id) => {
      this.pageId = id
    })
  }
}
