import { useState } from 'react';
import { ThumbnailOption } from '@/types/thumbnail.types';

export function useThumbnailState() {
  const [thumbnails, setThumbnails] = useState<ThumbnailOption[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const addGeneratedThumbnails = (newThumbnails: ThumbnailOption[]) => {
    setThumbnails(prev => [
      ...prev.filter(t => t.isCustom), // preserve custom
      ...newThumbnails
    ]);

    // Auto-select first if none selected
    if (selectedIndex === null && newThumbnails.length > 0) {
      setSelectedIndex(0);
    }
  };

  const addCustomThumbnail = (thumbnail: ThumbnailOption) => {
    setThumbnails(prev => {
      const withoutOldCustom = prev.filter(t => !t.isCustom);
      return [thumbnail, ...withoutOldCustom];
    });
    setSelectedIndex(0); // custom is always first
  };

  const removeCustomThumbnail = () => {
    setThumbnails(prev => prev.filter(t => !t.isCustom));
    if (selectedIndex === 0) {
      setSelectedIndex(null);
    }
  };

  const selectThumbnail = (index: number) => {
    setSelectedIndex(index);
  };

  const getSelectedThumbnail = () => {
    return selectedIndex !== null ? thumbnails[selectedIndex] : null;
  };

  return {
    thumbnails,
    selectedIndex,
    selectedThumbnail: getSelectedThumbnail(),
    addGeneratedThumbnails,
    addCustomThumbnail,
    removeCustomThumbnail,
    selectThumbnail
  };
}