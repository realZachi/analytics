import React from 'react'
import { rootRoute } from '../../router'
import { useAppNavigate } from '../../navigation/use-app-navigate'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '../../components/ui/dialog'

function Modal({ allowScroll, children, maxWidth, onClick, onClose }) {
  const modalRoot = document.getElementById('modal_root')

  if (!modalRoot) return null

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent
        container={modalRoot}
        showCloseButton={false}
        onClick={onClick}
        className={`top-4 min-h-[66vh] w-full translate-y-0 gap-0 p-3 shadow-xl sm:top-8 md:top-[3.2rem] md:min-h-120 md:px-6 md:py-4 ${
          allowScroll ? 'overflow-y-auto' : 'overflow-hidden'
        }`}
        style={{ maxWidth: maxWidth || '880px' }}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Dashboard report</DialogTitle>
          <DialogDescription>
            Detailed analytics and filtering controls
          </DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}

export default function ModalWithRouting(props) {
  const navigate = useAppNavigate()
  const onClose =
    props.onClose ??
    (() => navigate({ path: rootRoute.path, search: (search) => search }))

  return <Modal {...props} onClose={onClose} />
}
