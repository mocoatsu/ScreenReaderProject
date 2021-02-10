import { PostFire } from "../Common";
import { useHistory } from "react-router-dom";
import React, { useState, useEffect, useCallback } from "react";
import LoginRecommendForm from "../Users/LoginRecommend";
import { Button } from "@material-ui/core";
import { TextField } from "@material-ui/core";
import TopicTitle from "./TopicTitle";

interface PostTopicProps {
  // ログインユーザーのステータス
  userStatus: {
    userId: string;
    userName: string;
    session: boolean;
  };
  // ログインユーザーのブックマーク情報
  bookmarkTopicInfo: {
    id: string;
    topic_id: string;
    user_id: string;
  }[];
  // ユーザーのステータスをサーバーから取得する
  fetchUserStatus: () => Promise<any>;

  // ブックマーク情報更新のためのフック
  setBookMarkTopicInfo: React.Dispatch<
    React.SetStateAction<
      {
        id: string;
        topic_id: string;
        user_id: string;
      }[]
    >
  >;
  // リクエストが成功した時のメッセージを追加する配列
  requestSuccessMessage: string[];
  // リクエストが成功した時のメッセージを追加するフック
  setRequestSuccessMessage: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function PostTopic(props: PostTopicProps) {
  const history = useHistory();
  const [inputTitle, setInputTitle] = useState("");
  const [inputContent, setInputContent] = useState("");
  const [error, setError] = useState("");

  const postTopicToDB = useCallback(
    // 入力内容が不足しているときのバリデーション
    async (inputTitle: string, inputContent: string, postUserID: string) => {
      if (inputTitle == "") {
        setError("タイトルを記入してください");
        return;
      }
      if (inputContent == "") {
        setError("内容を記入してください");
        return;
      }

      const postTopicResult = PostFire("/post-topic", {
        title: inputTitle,
        content: inputContent,
        post_user_id: postUserID,
      });

      // トピック投稿に成功した場合はトピックリスト画面に遷移
      if (postTopicResult) {
        history.push("/");
        return;
      }

      // トピック投稿に失敗した場合はエラーをセット
      setError("トピック投稿に失敗しました");
    },
    []
  );

  // ログインしていなければログインボタン、そうでなければトピック送信ボタンを返す
  const LoginORSubmitButton = () => {
    if (!props.userStatus.session) {
      return (
        <div id="login-wrapper">
          <LoginRecommendForm
            fetchUserStatus={props.fetchUserStatus}
            dialogTitle="ログインすることでトピックの投稿ができます"
            buttonExplanation="ログインしてトピックを投稿"
          ></LoginRecommendForm>
        </div>
      );
    }
    return (
      <Button
        onClick={() => {
          postTopicToDB(inputTitle, inputContent, props.userStatus.userId);
        }}
        type="submit"
        variant="contained"
        color="primary"
      >
        トピックを送信
      </Button>
    );
  };

  // ユーザーのステータスを更新
  useEffect(() => {
    const fetchedData = async () => {
      props.fetchUserStatus();
    };
    fetchedData();
  }, []);

  return (
    <div id="post-topic-wrapper">
      <div id="topic-title-wrapper">
        <h3>タイトル</h3>
        <TextField
          id="title-form"
          type="textarea"
          variant="outlined"
          fullWidth
          inputProps={{ step: 300 }}
          placeholder="話し合いたいトピックのタイトルを記入してください"
          value={inputTitle}
          name="title"
          required
          onChange={(e) => {
            setInputTitle(e.target.value);
          }}
        />

      </div>
      <div id="topic-content-wrapper">
        <h3>内容</h3>
        <TextField
          id="post-topic-content-form"
          type="textarea"
          variant="outlined"
          placeholder="トピックの内容を記述してください"
          fullWidth
          multiline
          rows="4"
          inputProps={{ step: 300 }}
          value={inputContent}
          name="content"
          required
          onChange={(e) => {
            setInputContent(e.target.value);
          }}
        />
      </div>
      <div>
        <span>{error}</span>
      </div>
      {LoginORSubmitButton()}
    </div>
  );
}
