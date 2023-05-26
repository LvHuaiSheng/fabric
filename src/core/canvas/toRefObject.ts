import { FabricObject, ObjectRef, Textbox } from '@fabric'

/**
 * 元素添加相应式属性
 */
const toRefObject = (object: Textbox | FabricObject) => {
  if (object.ref) return object

  const keyArr: (keyof ObjectRef)[] = [
    'id',
    'name',
    'originX',
    'originY',
    'top',
    'left',
    'width',
    'height',
    'scaleX',
    'scaleY',
    'flipX',
    'flipY',
    'opacity',
    'angle',
    'skewX',
    'skewY',
    'cornerSize',
    'touchCornerSize',
    'transparentCorners',
    'hoverCursor',
    'moveCursor',
    'padding',
    'borderColor',
    'borderDashArray',
    'cornerColor',
    'cornerStrokeColor',
    'cornerStyle',
    'cornerDashArray',
    'centeredScaling',
    'centeredRotation',
    'fill',
    'fillRule',
    'globalCompositeOperation',
    'backgroundColor',
    'selectionBackgroundColor',
    'stroke',
    'strokeWidth',
    'strokeDashArray',
    'strokeDashOffset',
    'strokeLineCap',
    'strokeLineJoin',
    'strokeMiterLimit',
    'shadow',
    'borderOpacityWhenMoving',
    'borderScaleFactor',
    'minScaleLimit',
    'selectable',
    'evented',
    'visible',
    'hasControls',
    'hasBorders',
    'perPixelTargetFind',
    'includeDefaultValues',
    'lockMovementX',
    'lockMovementY',
    'lockRotation',
    'lockScalingX',
    'lockScalingY',
    'lockSkewingX',
    'lockSkewingY',
    'lockScalingFlip',
    'excludeFromExport',
    'objectCaching',
    'noScaleCache',
    'strokeUniform',
    'dirty',
    'paintFirst',
    'activeOn',
    'colorProperties',
    'inverted',
    'absolutePositioned',
  ]

  if (object.isType('Text', 'Textbox')) {
    keyArr.push(
      'text',
      'charSpacing',
      'lineHeight',
      'fontSize',
      'fontWeight',
      'fontFamily',
      'fontStyle',
      'pathSide',
      'pathAlign',
      'underline',
      'overline',
      'linethrough',
      'textAlign',
      'direction',
    )
  }

  object.ref = reactive({}) as ObjectRef

  keyArr.forEach(<K extends keyof ObjectRef>(key: K) => {
    object.ref[key] = (object as Textbox & FabricObject)[key]

    Object.defineProperty(object, key, {
      get() {
        return this.ref[key]
      },
      set(value) {
        if (this.ref[key] === value) return
        this.ref[key] = value
      },
    })
  })

  return object
}

export { toRefObject }
