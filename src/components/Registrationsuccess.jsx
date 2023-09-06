import React, { useEffect, useState } from 'react';

export default function Registrationsuccess() {
  const [isValidLink, setIsValidLink] = useState(false);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const timestamp = queryParams.get('timestamp');

    if (timestamp) {
      const TEN_MINUTES = 10 * 60 * 1000; // 10 minutes in milliseconds
      const currentTime = Date.now();
      const parsedTimestamp = parseInt(timestamp, 10); // Convert the timestamp to a number

      // Check if the timestamp is within the 10-minute validity window
      const isValid = currentTime - parsedTimestamp < TEN_MINUTES;
      setIsValidLink(isValid);
    }
  }, []);

  return (
    <div>
      {isValidLink ? (
        <p>Registration successful! You can now proceed.</p>
      ) : (
        <p>Invalid or expired registration link.</p>
      )}
    </div>
  );
}
