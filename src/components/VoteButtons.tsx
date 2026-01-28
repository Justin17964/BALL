import { useState } from 'react';
import { ArrowBigUp, ArrowBigDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface VoteButtonsProps {
  voteCount: number;
  userVote?: number | null;
  onVote: (voteType: number) => Promise<void>;
  orientation?: 'vertical' | 'horizontal';
}

export function VoteButtons({ voteCount, userVote, onVote, orientation = 'vertical' }: VoteButtonsProps) {
  const [isVoting, setIsVoting] = useState(false);
  const [currentVote, setCurrentVote] = useState(userVote);
  const [currentCount, setCurrentCount] = useState(voteCount);

  const handleVote = async (voteType: number) => {
    if (isVoting) return;

    setIsVoting(true);
    const oldVote = currentVote;
    const oldCount = currentCount;

    let newVote = voteType;
    let newCount = oldCount;

    if (oldVote === voteType) {
      newVote = 0;
      newCount = oldCount - voteType;
    } else if (oldVote) {
      newCount = oldCount - oldVote + voteType;
    } else {
      newCount = oldCount + voteType;
    }

    setCurrentVote(newVote === 0 ? null : newVote);
    setCurrentCount(newCount);

    try {
      await onVote(voteType);
    } catch (error) {
      setCurrentVote(oldVote);
      setCurrentCount(oldCount);
    } finally {
      setIsVoting(false);
    }
  };

  const containerClass = orientation === 'vertical'
    ? 'flex flex-col items-center gap-1'
    : 'flex items-center gap-2';

  return (
    <div className={containerClass}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleVote(1)}
        disabled={isVoting}
        className={cn(
          'h-8 w-8',
          currentVote === 1 && 'text-secondary hover:text-secondary'
        )}
      >
        <ArrowBigUp className={cn('w-5 h-5', currentVote === 1 && 'fill-current')} />
      </Button>

      <span className={cn(
        'font-bold text-sm min-w-[2rem] text-center',
        currentVote === 1 && 'text-secondary',
        currentVote === -1 && 'text-downvote'
      )}>
        {currentCount}
      </span>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleVote(-1)}
        disabled={isVoting}
        className={cn(
          'h-8 w-8',
          currentVote === -1 && 'text-downvote hover:text-downvote'
        )}
      >
        <ArrowBigDown className={cn('w-5 h-5', currentVote === -1 && 'fill-current')} />
      </Button>
    </div>
  );
}
