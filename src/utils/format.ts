// src/utils/format.ts
export function formatViews(views: number | null | undefined): string {
  if (views === null || views === undefined || isNaN(views)) {
    return '0';
  }
  
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
  return views.toString();
}

export function formatTimeAgo(date: string | Date | null | undefined): string {
  if (!date) return 'Unknown';
  
  try {
    const now = new Date();
    const past = new Date(date);
    const diffInMilliseconds = now.getTime() - past.getTime();
    const diffInSeconds = Math.floor(diffInMilliseconds / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    const diffInWeeks = Math.floor(diffInDays / 7);
    const diffInMonths = Math.floor(diffInDays / 30);
    const diffInYears = Math.floor(diffInDays / 365);

    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInWeeks < 4) return `${diffInWeeks} weeks ago`;
    if (diffInMonths < 12) return `${diffInMonths} months ago`;
    return `${diffInYears} years ago`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Unknown';
  }
}

export function formatDuration(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined || isNaN(seconds)) {
    return '0:00';
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function formatLikes(likes: number | null | undefined): string {
  if (likes === null || likes === undefined || isNaN(likes)) {
    return '0';
  }
  
  if (likes >= 1000000) return `${(likes / 1000000).toFixed(1)}M`;
  if (likes >= 1000) return `${(likes / 1000).toFixed(1)}K`;
  return likes.toString();
}

export function formatSubscribers(count: number | null | undefined): string {
  if (count === null || count === undefined || isNaN(count)) {
    return '0 subscribers';
  }
  
  if (count === 1) return '1 subscriber';
  
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M subscribers`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K subscribers`;
  return `${count} subscribers`;
}