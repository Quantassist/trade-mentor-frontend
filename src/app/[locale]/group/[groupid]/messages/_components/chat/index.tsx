// import { useAppSelector } from "@/redux/store"

// type ChatWindowProps = {
//     userid: string
//     recieverid: string
// }

// const ChatWindow = ({recieverid, userid}: ChatWindowProps) => {
//     const { messageWindowRef} = useChatWindow(recieverid)
//     const { chat } = useAppSelector((state) => state.chatReducer)
//     return (
//         <div ref={messageWindowRef} className="flex-1 flex py-5 flex-col gap-y-3 h-0 overflow-y-auto">
//             {chat.map((c) => (
//                 <ChatBubble key={c.id} {...c} userid={userid}/>
//             ))}
//         </div>
//     )
// }

// export default ChatWindow
