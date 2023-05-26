import { randomText } from '@/utils/strings'
import { Notification, Modal, Message } from '@arco-design/web-vue'
import type { App } from 'vue'

/**
 * 修改下拉列表最大高度到屏幕最下面
 * @popup-visible-change="popupMaxHeight"
 */
export const popupMaxHeight = () => {
  const randomClass = `a${randomText()}`

  const onPopupVisibleChange = (visible: boolean) => {
    if (!visible) return
    nextTick(() => {
      const wrapper = document.querySelector<HTMLDivElement>(
        `.${randomClass} .arco-select-dropdown-list-wrapper`,
      )
      if (!wrapper) return
      wrapper.style.maxHeight = `${window.innerHeight - wrapper.getBoundingClientRect().top - 8}px`
    })
  }

  return {
    triggerProps: {
      contentClass: randomClass,
    },
    onPopupVisibleChange,
  }
}

export const arcoPatch = (app: App) => {
  Notification._context = app._context
  Modal._context = app._context
  Message._context = app._context
}
