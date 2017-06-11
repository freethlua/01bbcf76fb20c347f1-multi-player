import getYoutubeId from 'get-youtube-id';
import vimeoRegex from 'vimeo-regex';
import urlParser from 'js-video-url-parser';

export const matchers = {
  youtube: {
    matcher: /youtu\.?be/,
    process: getYoutubeId,
  },
  vimeo: {
    matcher: /vimeo.com/,
    process: url => vimeoRegex().exec(url)[4],
  },
  dailymotion: {
    matcher: /dailymotion.com/,
    process: url => urlParser.parse(url).id,
  },
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
