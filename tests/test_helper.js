const Blog = require("../models/blog");
const mockBlogs = require("./mockBlog");

const initialBlogs = mockBlogs.slice(0, 2);

const nonExistingBlog = async () => {
  const blog = new Blog({ title: "will be deleted soon" });
  await blog.save();
  await blog.remove();

  return blog._id.toString();
};

const blogsInDb = async () => {
  const blogs = await Blog.find({});
  return blogs.map((entries) => entries.toJSON());
};

module.exports = { initialBlogs, nonExistingBlog, blogsInDb };
