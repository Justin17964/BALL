import { useState, KeyboardEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface HashtagInputProps {
  hashtags: string[];
  onChange: (hashtags: string[]) => void;
  placeholder?: string;
}

export function HashtagInput({ hashtags, onChange, placeholder = 'Add hashtags (press Enter)' }: HashtagInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addHashtag();
    } else if (e.key === 'Backspace' && !inputValue && hashtags.length > 0) {
      removeHashtag(hashtags.length - 1);
    }
  };

  const addHashtag = () => {
    const tag = inputValue.trim().toLowerCase().replace(/^#/, '');
    if (tag && !hashtags.includes(tag)) {
      onChange([...hashtags, tag]);
      setInputValue('');
    }
  };

  const removeHashtag = (index: number) => {
    onChange(hashtags.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 min-h-[2.5rem] p-2 border border-input rounded-md bg-background">
        {hashtags.map((tag, index) => (
          <Badge key={index} variant="secondary" className="gap-1">
            #{tag}
            <button
              type="button"
              onClick={() => removeHashtag(index)}
              className="ml-1 hover:text-destructive"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addHashtag}
          placeholder={hashtags.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-6"
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Press Enter to add a hashtag. At least one hashtag is required.
      </p>
    </div>
  );
}
