import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { mockChatHistories } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, MessageSquare, User, Bot, Clock, Coins, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const ChatLogs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChat, setSelectedChat] = useState<typeof mockChatHistories[0] | null>(null);

  const filteredChats = mockChatHistories.filter(
    (chat) =>
      chat.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.messages.some((m) => m.content.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <AdminLayout title="Chat Logs" subtitle="View user-AI conversation histories">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-180px)]">
        {/* Chat List */}
        <div className="glass-card p-4 flex flex-col">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search chats..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 input-dark"
            />
          </div>

          <ScrollArea className="flex-1">
            <div className="space-y-2">
              {filteredChats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className={cn(
                    'w-full p-4 rounded-lg text-left transition-all duration-200',
                    selectedChat?.id === chat.id
                      ? 'bg-primary/20 border border-primary/30'
                      : 'bg-muted/30 hover:bg-muted/50 border border-transparent'
                  )}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{chat.userName}</p>
                      <p className="text-xs text-muted-foreground">{chat.createdAt}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {chat.messages[0]?.content}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      {chat.messages.length} messages
                    </span>
                    <span className="flex items-center gap-1">
                      <Coins className="w-3 h-3" />
                      {chat.tokensUsed} tokens
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Chat Viewer */}
        <div className="lg:col-span-2 glass-card p-4 flex flex-col">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{selectedChat.userName}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      {selectedChat.createdAt}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="badge-primary flex items-center gap-1">
                    <Coins className="w-3 h-3" />
                    {selectedChat.tokensUsed} tokens
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedChat(null)}
                    className="lg:hidden"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1">
                <div className="space-y-4 pr-4">
                  {selectedChat.messages.map((message, index) => (
                    <div
                      key={index}
                      className={cn(
                        'flex gap-3',
                        message.role === 'user' ? 'flex-row-reverse' : ''
                      )}
                    >
                      <div
                        className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                          message.role === 'user' ? 'bg-primary/20' : 'bg-success/20'
                        )}
                      >
                        {message.role === 'user' ? (
                          <User className="w-4 h-4 text-primary" />
                        ) : (
                          <Bot className="w-4 h-4 text-success" />
                        )}
                      </div>
                      <div
                        className={cn(
                          'max-w-[80%] rounded-2xl p-4',
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground rounded-tr-sm'
                            : 'bg-muted text-foreground rounded-tl-sm'
                        )}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p
                          className={cn(
                            'text-xs mt-2',
                            message.role === 'user'
                              ? 'text-primary-foreground/70'
                              : 'text-muted-foreground'
                          )}
                        >
                          {message.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No Chat Selected</h3>
              <p className="text-muted-foreground">
                Select a conversation from the list to view details
              </p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default ChatLogs;
