const db = require("../db");

//misal function buat dapat seluruh post yang sudah dipublished
function getAllPosts() {
  const posts = await db.post.findMany({
    where: {
      published: true 
    }
  });
  return posts;
}