"use client"

import { cn } from "@/lib/utils"
import {
    DragDropContext,
    Draggable,
    Droppable,
    type DraggableProvidedDragHandleProps,
    type DropResult,
} from "@hello-pangea/dnd"
import React from "react"

export type RenderItemHandleProps = DraggableProvidedDragHandleProps | null | undefined

export type ReorderableListProps<T> = {
  droppableId: string
  items: T[]
  getId: (item: T, index: number) => string
  renderItem: (
    item: T,
    index: number,
    handleProps: RenderItemHandleProps,
  ) => React.ReactNode
  onReorder: (newItems: T[], orderedIds: string[]) => void
  className?: string
  itemClassName?: string
}

function reorderArray<T>(list: T[], startIndex: number, endIndex: number) {
  const result = Array.from(list)
  const [removed] = result.splice(startIndex, 1)
  result.splice(endIndex, 0, removed)
  return result
}

export function ReorderableList<T>({
  droppableId,
  items,
  getId,
  renderItem,
  onReorder,
  className,
  itemClassName,
}: ReorderableListProps<T>) {
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return
    const { source, destination } = result
    if (source.index === destination.index) return
    const newItems = reorderArray(items, source.index, destination.index)
    const orderedIds = newItems.map((item, idx) => getId(item, idx))
    onReorder(newItems, orderedIds)
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId={droppableId}>
        {(dropProvided) => (
          <div ref={dropProvided.innerRef} {...dropProvided.droppableProps} className={cn(className)}>
            {items.map((item, index) => (
              <Draggable key={getId(item, index)} draggableId={getId(item, index)} index={index}>
                {(dragProvided) => (
                  <div
                    ref={dragProvided.innerRef}
                    {...dragProvided.draggableProps}
                    className={cn(itemClassName)}
                  >
                    {renderItem(item, index, dragProvided.dragHandleProps)}
                  </div>
                )}
              </Draggable>
            ))}
            {dropProvided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  )
}

export type DroppableListProps<T> = Omit<ReorderableListProps<T>, "onReorder"> & {
  // purely presentational list used inside a parent DragDropContext
}

export function DroppableList<T>({
  droppableId,
  items,
  getId,
  renderItem,
  className,
  itemClassName,
}: DroppableListProps<T>) {
  return (
    <Droppable droppableId={droppableId}>
      {(dropProvided) => (
        <div ref={dropProvided.innerRef} {...dropProvided.droppableProps} className={cn(className)}>
          {items.map((item, index) => (
            <Draggable key={getId(item, index)} draggableId={getId(item, index)} index={index}>
              {(dragProvided) => (
                <div
                  ref={dragProvided.innerRef}
                  {...dragProvided.draggableProps}
                  className={cn(itemClassName)}
                >
                  {renderItem(item, index, dragProvided.dragHandleProps)}
                </div>
              )}
            </Draggable>
          ))}
          {dropProvided.placeholder}
        </div>
      )}
    </Droppable>
  )
}
