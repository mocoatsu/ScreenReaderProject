const express = require("express");
const router = express.Router();
const mysql = require("mysql2");


// トピックのタイトルと内容を返す
router.post("/:topicID/topic", function (req, res, next) {
  const connection = mysql.createConnection({
    host: "mysql",
    user: "root",
    password: "root",
    database: "ScreenReaderProject",
    port: "3306",
  });

  connection.query(
    {
      sql: "SELECT * FROM topic WHERE id=?",
      timeout: 40000, // 40s
      values: req.params["topicID"],
    },
    function responseTopic(error, results, fields) {
      res.json(results[0]);
    }
  );
});

// トピックに対する回答を登録する
router.post("/:topicID/postResponse", function (req, res, next) {
  const connection = mysql.createConnection({
    host: "mysql",
    user: "root",
    password: "root",
    database: "ScreenReaderProject",
    port: "3306",
  });
  // トピックのレスポンスを登録
  connection.query(
    {
      sql: "insert into response_to_topic SET ?",
      timeout: 40000, // 40s
      values: {
        content: req.body["inputValue"],
        topic_id: req.params["topicID"],
        response_user_id: req.body["response_user_id"],
      },
    },
    function responseInsertResponseToTopic(err, results, fields) {
      if (err) {
        console.log("error", err);
        return res
          .status(500)
          .send({ err: "トピックの回答を投稿できませんでした" });
      }
      console.log("トピックの回答の投稿に成功しました");
      console.log("results", results);
    }
  );

  // トピックに対するレスポンスデータを返却
  connection.query(
    {
      sql: "SELECT * FROM response_to_topic WHERE topic_id=?",
      timeout: 40000, // 40s
      values: req.params["topicID"],
    },
    function responseToTopic(error, results, fields) {
      return res.json(results);
    }
  );
});

router.post("/:topicID/getAllResponseToTopic", function (req, res, next) {
  const connection = mysql.createConnection({
    host: "mysql",
    user: "root",
    password: "root",
    database: "ScreenReaderProject",
    port: "3306",
  });

  // トピックに対するレスポンスデータを返却
  connection.query(
    {
      sql: "SELECT * FROM response_to_topic WHERE topic_id=?",
      timeout: 40000, // 40s
      values: req.params["topicID"],
    },
    function responseTopic(error, results, fields) {
      return res.json(results);
    }
  );
});

router.post("/set-topic-not-active", function (req, res, next) {
  const connection = mysql.createConnection({
    host: "mysql",
    user: "root",
    password: "root",
    database: "ScreenReaderProject",
    port: "3306",
  });
  console.log(req.body, req.body["topic_id"], req);
  connection.query(
    {
      sql: "UPDATE topic SET is_topic_active = 0 WHERE id = ?",
      timeout: 40000, // 40s
      values: req.query["topic_id"],
    },
    function responseSuccessMessage(error, results, fields) {
      if (!error == null) {
        console.log(error);
        return res.status(500).send({ err: err.message });
      }
      console.log(results);

      res.json({ "This topic is closed": true });
    }
  );
});
module.exports = router;
