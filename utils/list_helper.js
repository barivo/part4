const dummy = blogs => {
  return 1;
};

const totalLikes = blogs => {
  return blogs.map(x => x.likes).reduce((acc, x) => acc + x);
};

const favoriteBlog = blogs => {
  const top = blogs
    .map(x => [x.likes, x.title, x.author])
    .sort((a, b) => b[0] - a[0])[0];
  return { title: top[1], author: top[2], likes: top[0] };
};

const mostBlogs = blogs => {
  topBloggers = {};
  blogs.forEach(entry => {
    if (topBloggers[entry.author]) {
      topBloggers[entry.author] += 1;
    } else {
      topBloggers[entry.author] = 1;
    }
  });

  const top = Object.entries(topBloggers).sort((a, b) => b[1] - a[1])[0];
  return { author: top[0], blogs: top[1] };
};

const mostLikes = blogs => {
  topBloggers = {};
  blogs.forEach(entry => {
    if (topBloggers[entry.author]) {
      topBloggers[entry.author] += entry.likes;
    } else {
      topBloggers[entry.author] = entry.likes;
    }
  });

  const top = Object.entries(topBloggers).sort((a, b) => b[1] - a[1])[0];
  return { author: top[0], likes: top[1] };
};

module.exports = { dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes };
