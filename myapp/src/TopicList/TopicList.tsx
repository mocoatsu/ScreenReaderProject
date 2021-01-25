import axios from "axios";
import React, { useState, useEffect, useContext, useCallback } from "react";
import { Link } from "react-router-dom";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import Divider from "@material-ui/core/Divider";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import BookMark from "../BookMark";
import "./css/style.css";


const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    flex: {
      flexGrow: 1,
    },
    paper: {
      height: 140,
      width: 100,
    },
    control: {
      padding: theme.spacing(2),
    },
    root: {
      width: "100%",
      maxWidth: "100%",
      backgroundColor: theme.palette.background.paper,
    },
    inline: {
      display: "inline",
    },
  })
);

interface TopicListProps {
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
}[]

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

  requestToApiServer: (
    endpoint: string,
    user_id: string,
    topic_id: string
  ) => Promise<any>;

  requestSuccessMessage: string[];
  setRequestSuccessMessage: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function TopicList(props: TopicListProps) {
  const classes = useStyles();
  const [topicsInformation, setTopicsInformation] = useState([
    {
      id: "",
      title: "",
      content: "",
      is_topic_active: 1,
      post_user_id: "",
      username: "",
      created_at: "",
      "COUNT(response.id)": "",
    },
  ]);

  const [shownTopics, setShownTopics] = useState([
    {
      id: "",
      title: "",
      content: "",
      is_topic_active: 1,
      post_user_id: "",
      username: "",
      created_at: "",
      "COUNT(response.id)": "",
    },
  ]);


  const [filter, setFilter] = useState("all");

  const topicStatus = (topic: any) => {
    if (topic.is_topic_active) {
      return (
        <div>
          <div className="topic-is-active-true">
            <span>受付中</span>
          </div>
          <div className="count-response">
            <span>回答</span>
            <span className="number-of-response">
              {topic["COUNT(response.id)"]}
            </span>
            <span>件</span>
          </div>
        </div>
      );
    }
    return (
      <div>
        <div className="topic-is-active-false">
          <span>締め切り</span>
        </div>
        <div className="count-response">
          <span>回答</span>
          <span className="number-of-response">
            {topic["COUNT(response.id)"]}
          </span>
          <span>件</span>
        </div>
      </div>
    );
  };

  const showBookMark = (topicId: string) => {
    // ブックマークしているトピックIDを返す
    const bookmarkTopicID = props.bookmarkTopicInfo.map((eachTopic) => {
      return eachTopic.topic_id;
    });
    // トピックがブックマークされている場合のJSXを返す
    if (
      props.userStatus.session &&
      bookmarkTopicID.some((id) => id == topicId)
    ) {
      return (
        <BookMark
          bookmark={true}
          userID={props.userStatus.userId}
          topicID={topicId}
          endpoint="drop"
          requestSuccessMessage={props.requestSuccessMessage}
          setRequestSuccessMessage={props.setRequestSuccessMessage}
        ></BookMark>
      );
    }

    // ログイン済みでトピックがブックマークされていない場合のJSXを返す
    if (props.userStatus.session) {
      return (
        <BookMark
          bookmark={false}
          userID={props.userStatus.userId}
          topicID={topicId}
          endpoint="register"
          requestSuccessMessage={props.requestSuccessMessage}
          setRequestSuccessMessage={props.setRequestSuccessMessage}
        ></BookMark>
      );
    }
    return null;
  };

  useEffect(() => {
    const fetchFromDB = async () => {
      const topicListInfo = await props.requestToApiServer("/", "", "");
      setTopicsInformation(topicListInfo);
      setShownTopics(topicListInfo);
      const bookMarkTopic = await props.requestToApiServer(
        "/users/fetch-bookmark-topic",
        props.userStatus.userId,
        ""
      );
      props.setBookMarkTopicInfo(bookMarkTopic);
    };
    fetchFromDB();
  }, [props.userStatus]);

  // ブックマークの状態が変化した際に実行
  useEffect(() => {
    const fetchBookmarkInfo = async () => {
      const bookMarkTopic = await props.requestToApiServer(
        "/users/fetch-bookmark-topic",
        props.userStatus.userId,
        ""
      );
      props.setBookMarkTopicInfo(bookMarkTopic);
    };
    fetchBookmarkInfo();
  }, [props.requestSuccessMessage]);

  // フィルターにより表示するトピックを制御
  useEffect(() => {
    const filterTopics = async () => {
      // すべてのトピックを返す
      if (filter == "all") {
        setShownTopics(topicsInformation);
      }
      if (filter == "open") {
        // トピックへの回答が受付中のトピックを返す
        const filterdTopics = topicsInformation.filter((topic) => {
          return topic.is_topic_active == 1;
        });
        setShownTopics(filterdTopics);
      }
      if (filter == "closed") {
        // トピックへの回答が締め切られたトピックを返す
        const filterdTopics = topicsInformation.filter((topic) => {
          return topic.is_topic_active == 0;
        });
        setShownTopics(filterdTopics);
      }
      if (filter == "mytopic") {
        // ログインしているユーザーが投稿したトピックを返す
        const filterdTopics = topicsInformation.filter((topic) => {
          return topic.post_user_id == props.userStatus.userId;
        });
        setShownTopics(filterdTopics);
      }
      if (filter == "bookmark-topic") {
        // ブックマークされたトピックIDの配列を返す
        const bookmarkTopicID = props.bookmarkTopicInfo.map((eachTopic) => {
          return eachTopic.topic_id;
        });
        // 配列の中にIDが含まれているトピックのデータを返す
        const filterdTopics = topicsInformation.filter((topic) => {
          return bookmarkTopicID.some((id) => id == topic.id);
        });
        setShownTopics(filterdTopics);
      }
    };
    filterTopics();
  }, [filter]);

  return (
    <div id="topic-list-wrapper">
      <div>
        <h1>トピック一覧</h1>
        <Divider variant="fullWidth" />
        <Filter setFilter={setFilter}></Filter>
      </div>
      {shownTopics.map((topic, index) => {
        return (
          <div className="topic-wrapper">
            <div className="topic-main">
              <div className="topic-main-content">
                <Grid container spacing={1}>
                  <Grid item xs={2} className="topic-side-menu">
                    {topicStatus(topic)}
                  </Grid>

                  <Grid item xs={10}>
                    <div>
                      <h2 className="topic-list-title">
                        <Link to={"/topic-detail/" + topic.id}>
                          {formatTopicTitle(topic.title)}
                        </Link>
                      </h2>
                    </div>

                    <div className="topic-list-status">
                      {showBookMark(topic.id)}
                      <div>
                        <a className="flex-status-name">
                          投稿者 {topic.username}
                        </a>
                        <span>{formatDateTime(topic.created_at)}</span>
                      </div>
                    </div>
                  </Grid>
                </Grid>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function formatTopicTitle(topicTitle: string): string {
  if (topicTitle.length < 50) {
    return topicTitle;
  }
  return topicTitle.substr(0, 50) + "...";
}

function formatDateTime(datetime: string): string {
  const separatedDateTime = datetime.match(
    /(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/
  );
  if (separatedDateTime?.length == 6) {
    return (
      separatedDateTime[1] +
      "年" +
      separatedDateTime[2] +
      "月" +
      separatedDateTime[3] +
      "日" +
      separatedDateTime[4] +
      ":" +
      separatedDateTime[5]
    );
  }
  return "";
}

interface FilterProps {
  setFilter: React.Dispatch<React.SetStateAction<string>>;
}
function Filter(props: FilterProps) {
  const useStyles = makeStyles((theme: Theme) =>
    createStyles({
      root: {
        flexGrow: 1,
        boxShadow: "none",
        paddingBottom: "30px",
      },
    })
  );

  const classes = useStyles();

  const [filter, setFilter] = useState("all");
  const handleChange = (event: React.ChangeEvent<{}>, newValue: string) => {
    setFilter(newValue);
    props.setFilter(newValue);
  };

  return (
    <Paper className={classes.root}>
      <Tabs
        value={filter}
        onChange={handleChange}
        indicatorColor="primary"
        textColor="primary"
        aria-label="simple tabs example"
      >
        <Tab label="すべて表示" value="all" />
        <Tab label="受付中" value="open" />
        <Tab label="締め切り" value="closed" />
        <Tab label="投稿したトピック" value="mytopic" />
        <Tab label="ブックマークしたトピック" value="bookmark-topic" />
      </Tabs>
    </Paper>
  );
}
