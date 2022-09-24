const dummy = (blogs) => {
  return 1;
};

const totalLikes = (blogs) => {
  const reducer = (sumBlogsLikes, blog) => sumBlogsLikes + blog.likes;
  return blogs.reduce(reducer, 0);
};

const favoriteBlog = (blogs) => {
  const reducer = (prev, next) => {
    if (next.likes > prev.likes) {
      return next;
    } else {
      return prev;
    }
  };
  return blogs.reduce(reducer);
};

const mostBlogs = (blogs) => {
  const reducer = (prev, next) => {
    console.log(prev);
    console.log("-----");
    console.log(next);
    prev[next.author] = prev[next.author] ? prev[next.author] + 1 : 1;
    console.log("----");
    console.log(prev[next.author]);
    return prev;
  };
  const mostBlogsObj = blogs.reduce(reducer, {});

  let authorWithMostBlogs = {
    author: "nameless",
    blogs: 0,
  };
  const mostBlogsMap = new Map(Object.entries(mostBlogsObj));
  mostBlogsMap.forEach((value, key) => {
    if (value > authorWithMostBlogs.blogs) {
      authorWithMostBlogs.author = key;
      authorWithMostBlogs.blogs = value;
    }
  });
  return authorWithMostBlogs;
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
};
