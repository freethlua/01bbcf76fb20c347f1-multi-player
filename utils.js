import getYoutubeId from 'get-youtube-id';

export const matchers = {
  youtube: {
    matcher: /youtu\.?be/,
    process: getYoutubeId,
  }
}


export const processUrl = url => {
  for (const label of Object.keys(matchers)) {
    const matcher = matchers[label];
    if (matcher.matcher && url.match(matcher.matcher)) {
      const processedUrl = matcher.process ? matcher.process(url) : url;
      return {
        player: label,
        url: processedUrl,
      }
    }
  }
};
