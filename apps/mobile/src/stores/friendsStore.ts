import { atom } from 'jotai';
import type { User } from '@/services/api';

export interface Friend extends User {
  status: 'pending' | 'accepted' | 'rejected';
  requested_at?: string;
}

// Friends list
export const friendsAtom = atom<Friend[]>([]);

// Pending friend requests (received)
export const pendingRequestsAtom = atom<Friend[]>([]);

// Sent friend requests (waiting for response)
export const sentRequestsAtom = atom<Friend[]>([]);

// Search results
export const friendSearchResultsAtom = atom<User[]>([]);

// Add friend
export const addFriendAtom = atom(null, (get, set, friend: Friend) => {
  const friends = get(friendsAtom);
  const existingIndex = friends.findIndex((f) => f.id === friend.id);

  if (existingIndex >= 0) {
    const updatedFriends = [...friends];
    updatedFriends[existingIndex] = friend;
    set(friendsAtom, updatedFriends);
  } else {
    set(friendsAtom, [friend, ...friends]);
  }
});

// Remove friend
export const removeFriendAtom = atom(null, (get, set, friendId: string) => {
  const friends = get(friendsAtom);
  set(
    friendsAtom,
    friends.filter((f) => f.id !== friendId),
  );
});

// Update friend status
export const updateFriendStatusAtom = atom(
  null,
  (
    get,
    set,
    { friendId, status }: { friendId: string; status: 'pending' | 'accepted' | 'rejected' },
  ) => {
    const friends = get(friendsAtom);
    const updatedFriends = friends.map((f) => (f.id === friendId ? { ...f, status } : f));
    set(friendsAtom, updatedFriends);
  },
);

// Add pending request
export const addPendingRequestAtom = atom(null, (get, set, request: Friend) => {
  const requests = get(pendingRequestsAtom);
  set(pendingRequestsAtom, [request, ...requests]);
});

// Remove pending request
export const removePendingRequestAtom = atom(null, (get, set, requestId: string) => {
  const requests = get(pendingRequestsAtom);
  set(
    pendingRequestsAtom,
    requests.filter((r) => r.id !== requestId),
  );
});

// Add sent request
export const addSentRequestAtom = atom(null, (get, set, request: Friend) => {
  const requests = get(sentRequestsAtom);
  set(sentRequestsAtom, [request, ...requests]);
});

// Remove sent request
export const removeSentRequestAtom = atom(null, (get, set, requestId: string) => {
  const requests = get(sentRequestsAtom);
  set(
    sentRequestsAtom,
    requests.filter((r) => r.id !== requestId),
  );
});

// Set search results
export const setSearchResultsAtom = atom(null, (get, set, results: User[]) => {
  set(friendSearchResultsAtom, results);
});

// Clear search results
export const clearSearchResultsAtom = atom(null, (get, set) => {
  set(friendSearchResultsAtom, []);
});
