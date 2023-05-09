export async function acceptRequest(
  user: User,
  setFriendRequest: React.Dispatch<React.SetStateAction<User[]>>,
  setIsLoadingButton: React.Dispatch<React.SetStateAction<boolean>>,
  setFriends: React.Dispatch<React.SetStateAction<User[]>>,
) {
  try {
    setIsLoadingButton(true);
    await fetch('/api/friends/accept', {
      body: JSON.stringify(user),
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    setFriendRequest((prev: User[]) => {
      const fresh = prev.filter((x) => x.id !== user.id);
      return fresh;
    });
    setFriends((prev: User[]) => {
      user.timestamp = Date.now();
      user.text = 'Start a conversation...';
      return [user, ...prev];
    });
  } catch (err) {
    console.log('Error calling /api/friends/accept');
  } finally {
    setIsLoadingButton(false);
  }
}

export async function dismissRequest(
  user: User,
  setFriendRequest: React.Dispatch<React.SetStateAction<User[]>>,
  setIsLoadingButton: React.Dispatch<React.SetStateAction<boolean>>,
) {
  try {
    setIsLoadingButton(true);
    await fetch('/api/friends/deny', {
      body: JSON.stringify(user),
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    setFriendRequest((prev: User[]) => {
      const fresh = prev.filter((x) => x.id !== user.id);
      return fresh;
    });
  } catch (err) {
    console.log('Error calling /api/friends/accept');
  } finally {
    setIsLoadingButton(false);
  }
}
