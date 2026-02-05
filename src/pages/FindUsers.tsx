import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, MessageCircle } from 'lucide-react';
import { supabase } from '@/db/supabase';
import type { Profile } from '@/types';

export default function FindUsers() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setHasSearched(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`username.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`)
        .limit(20);

      if (error) throw error;
      setSearchResults(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleStartChat = (userId: string) => {
    navigate(`/messages/${userId}`);
  };

  return (
    <div className="container max-w-4xl mx-auto p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Find Users</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2 mb-6">
            <Input
              type="text"
              placeholder="Search by username or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={isSearching}>
              <Search className="w-4 h-4 mr-2" />
              {isSearching ? 'Searching...' : 'Search'}
            </Button>
          </form>

          {hasSearched && (
            <div className="space-y-3">
              {searchResults.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No users found matching "{searchQuery}"
                </div>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground mb-4">
                    Found {searchResults.length} user{searchResults.length !== 1 ? 's' : ''}
                  </p>
                  {searchResults.map((user) => (
                    <Card key={user.id} className="hover:bg-accent/50 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={user.avatar_url || undefined} />
                              <AvatarFallback>
                                {user.username?.charAt(0).toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold">{user.username}</p>
                              {user.email && (
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                              )}
                              {user.bio && (
                                <p className="text-sm text-muted-foreground mt-1">{user.bio}</p>
                              )}
                            </div>
                          </div>
                          <Button
                            onClick={() => handleStartChat(user.id)}
                            size="sm"
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Message
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </>
              )}
            </div>
          )}

          {!hasSearched && (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Enter a username or email to find users</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
