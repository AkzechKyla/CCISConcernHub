import { useEffect, useState, useRef, useCallback } from 'react';
import Message from '../models/message';
import { formatDate } from '../utils';

export default function DiscussionThread({ userData, concern, status, setStatus }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const textareaRef = useRef(null);

    const bottomMessageElement = useCallback((element) => {
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
        }
    }, []);

    useEffect(() => {
        async function fetchDiscussion() {
            if (!concern.hasDiscussion) return;
            setMessages(await concern.discussion.fetchMessages());
        }
        fetchDiscussion();

        concern.discussion.listenForNewMessages((message) => {
            setMessages((messages) => {
                return [...messages, message];
            });
        });
    }, [concern]);

    const handleSendMessage = async () => {
        if (!concern.hasDiscussion) {
            concern.setHasDiscussion(true);
        }

        if (newMessage.trim()) {
            const newMsg = new Message({
                sender: {
                    uid: userData.uid,
                    displayName: userData.displayName,
                    avatarUrl: userData.getAvatarUrl(),
                },
                text: newMessage,
                timestamp: new Date().toISOString(),
            });

            setNewMessage("");

            if (textareaRef.current) {
                textareaRef.current.style.height = "auto";
            }

            await concern.discussion.sendMessage(newMsg);
        }

        if (userData.isAdmin() && status === "Open") {
            setStatus("In Progress");
        }

        if (userData.isAdmin() && !concern.isAdminAssigned(userData)) {
            concern.assignAdmin(userData);
        }

        concern.saveToDatabase();
    };

    const adjustHeight = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "auto";
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    };

    return (
        <div className="p-4 rounded-md mb-8 mx-14">
            <div className="border mb-10 "></div>
            <h3 className="text-xl font-semibold mt-2 mb-10">Discussion Thread</h3>
            <div className="max-h-80 overflow-y-auto mb-4">
                <div className="text-center text-xs text-gray-500 mt-4 mb-5">
                    <p>{formatDate(concern.getDateSubmitted())}</p>
                    <p>30 days of inactivity will automatically close the concern.</p>
                </div>

                {messages.map((msg, index) => {
                    let elem;

                    if (msg.sender.uid === "system-message") {
                        elem = <div className="text-center text-xs text-gray-500 mt-5 mb-5">
                            <p>{formatDate(new Date())}</p>
                            <p>{msg.text}</p>
                        </div>;
                    } else {
                        elem = <div className="relative">
                            <div className="pr-3 pl-3 text-sm pt-3">
                                <p className="ml-1 text-gray-600 text-xs text-left pb-2">
                                    <strong>{msg.sender.displayName}</strong>
                                </p>
                                <p className="ml-1 text-sm break-all overflow-hidden pb-3">
                                    {msg.text}
                                </p>
                                <p className="absolute right-0 top-0 text-xs text-gray-500 text-right mr-4 pt-3">
                                    {formatDate(msg.timestamp)}
                                </p>
                                <div className="border-gray-300 border-t-[0.5px]"></div>
                            </div>
                        </div>;
                    }

                    return <div
                        key={index}
                        ref={index === messages.length - 1 ? bottomMessageElement : null}
                    >{elem}</div>;
                })}
            </div>

            {/* Input for new message */}
            <div className="bg-gray-100 ml-3 flex flex-col border border-gray-300 rounded-md mt-8 overflow-hidden">
                <textarea
                    ref={textareaRef}
                    value={newMessage}
                    onChange={(e) => {
                        setNewMessage(e.target.value);
                        adjustHeight();
                    }}
                    onKeyDown={(event) => {
                        if (event.key === "Enter") {
                            if (!event.shiftKey) {
                                event.preventDefault();
                                handleSendMessage();
                            }
                        }
                    }}
                    placeholder="Type your message here..."
                    className="bg-gray-100 px-4 py-2 outline-none resize-none min-h-[40px] max-h-32 overflow-y-auto text-sm"
                    rows={1}
                />
                <div className="flex justify-end">
                    <button
                        onClick={handleSendMessage}
                        className="bg-blue-500 text-white text-sm px-4 py-1 m-2 rounded-xl hover:bg-blue-600"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};
