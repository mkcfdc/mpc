import fetch from 'node-fetch';

async function getAccountInfo(premiumizeAPIKey) {
  try {
    const response = await fetch('https://www.premiumize.me/api/account/info', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${premiumizeAPIKey}`,
        'Accept': 'application/json'
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching account info:', error);
    throw new Error('Internal server error');
  }
}

async function checkCache(magnetLink, apiKey) {
  if (!apiKey) {
    return null;
  }

  const apiUrl = 'https://www.premiumize.me/api/cache/check';
  const encodedMagnetLink = encodeURIComponent(magnetLink);
  const url = `${apiUrl}?items%5B%5D=${encodedMagnetLink}`;
  const headers = {
    'Accept': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  };

  try {
    const response = await fetch(url, { headers });
    const data = await response.json();

    return (data.status === 'success' && data.response[0]) || null;
  } catch (error) {
    console.error('Error checking cache:', error);
    return null;
  }
}

async function directLink(magnetLink, apiKey) {
  if (!apiKey) {
    return null;
  }

  const apiUrl = 'https://www.premiumize.me/api/transfer/directdl';
  const data = `src=${encodeURIComponent(magnetLink)}`;
  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/x-www-form-urlencoded',
    'Accept': 'application/json'
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: data
    });

    const responseData = await response.json();

    if (responseData.status === 'success' && responseData.content && responseData.content.length > 0) {
      const largestFile = responseData.content.reduce((prev, current) => {
        return prev.size > current.size ? prev : current;
      });

      return largestFile.stream_link;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting direct link:', error);
    return null;
  }
}

async function addToPremiumize(magnetLink, apiKey) {
  const apiUrl = 'https://www.premiumize.me/api/transfer/create';
  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Accept': 'application/json',
    'Content-Type': 'multipart/form-data'
  };

  const formData = new URLSearchParams();
  formData.append('src', magnetLink);

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: formData
    });

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error('Error adding to Premiumize:', error);
    return null;
  }
}



export { checkCache, directLink, addToPremiumize, getAccountInfo };