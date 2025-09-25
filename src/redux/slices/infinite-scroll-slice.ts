import { createSlice, PayloadAction } from "@reduxjs/toolkit"

type InitialStateProps = {
  data: unknown[]
}

const InitialState: InitialStateProps = {
  data: [],
}

export const InfiniteScroll = createSlice({
  name: "InfiniteScroll",
  initialState: InitialState,
  reducers: {
    onInfiniteScroll: (state, action: PayloadAction<InitialStateProps>) => {
      //check for duplicates
      const list = state.data.find((data: any) =>
        action.payload.data.find((payload: any) => data.id === payload.id),
      )

      if (!list) state.data = [...state.data, ...action.payload.data]
    },
    onClearList: (state, action) => {
      state.data = action.payload.data
    },
    onRemoveItem: (state, action: PayloadAction<{ id: string }>) => {
      state.data = state.data.filter(
        (item: any) => item.id !== action.payload.id,
      )
    },
  },
})

export const { onInfiniteScroll, onClearList, onRemoveItem } =
  InfiniteScroll.actions
export default InfiniteScroll.reducer
