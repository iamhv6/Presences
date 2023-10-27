const presence = new Presence({
    clientId: "1161544315105976342",
}),
    browsingTimestamp = Math.floor(Date.now() / 1000);

async function postGQLAPI(operationName: string, query: string, vars: object) {
    const token = JSON.parse(JSON.parse(localStorage.getItem("persist:Token_Data_Persist")).jwtIdToken),
        response = await fetch(
            "https://api.spyke.social/graphql",
            {
                method: "POST",
                headers: {
                    authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    query,
                    variables: vars,
                    operationName,
                })
            });
    return response.json();
}

let url = "https://spyke.social/";

presence.on("UpdateData", () => {
    const nurl = document.URL;
    if (nurl !== url) {
        const presenceData: PresenceData = {
            largeImageKey: "https://i.imgur.com/v10pkZA.png",
            smallImageKey: "https://i.imgur.com/55dCzB1.png",
            details: "A Community Discussion Platform",
            state: "On Homepage",
            startTimestamp: browsingTimestamp,
        };
        presenceData.buttons = [{ label: "View Spyke", url: "https://spyke.social/" }];

        if (document.URL.includes("/p/")) {
            const PostId = document.URL.split("/p/")[1];
            postGQLAPI("presencepst", `query presencepst($id: ID!) {
  comments(ids: [$id]) {
    ... on Post {
      title
      content {
        id
        data
        __typename
      }
      communities {
        name
        dp 
      }
    }
  }
}`,
                { id: PostId }).then((res) => {
                    if (res.data.comments[0].content[0].__typename === "Image") {
                        presenceData.largeImageKey = res.data.comments[0].content[0].data;
                        presenceData.smallImageKey = res.data.comments[0].communities[0].dp;
                        presenceData.details = `Reading post in ${res.data.comments[0].communities[0].name}`;
                        presenceData.state = res.data.comments[0].title;
                        presenceData.buttons = [{ url: document.URL, label: "View Post" }];
                        presence.setActivity(presenceData);
                    } else {
                        presenceData.largeImageKey = res.data.comments[0].communities[0].dp;
                        presenceData.smallImageKey = "https://i.imgur.com/v10pkZA.png";
                        presenceData.details = `Reading post in ${res.data.comments[0].communities[0].name}`;
                        presenceData.state = res.data.comments[0].title;
                        presenceData.buttons = [{ url: document.URL, label: "View Post" }];
                        presence.setActivity(presenceData);
                    }
                });
        } else if (document.URL.includes("/g/")) {
            const GroupName = document.URL.split("/g/")[1];
            postGQLAPI("presencegrp", "query presencegrp($name:String!){ communityByName(name:$name) { name dp cover}}",
                { name: GroupName }).then((res) => {
                    presenceData.largeImageKey = res.data.communityByName.cover;
                    presenceData.smallImageKey = res.data.communityByName.dp;
                    presenceData.state = `${res.data.communityByName.name}`;
                    presenceData.details = "Viewing a Clan";
                    presenceData.buttons = [{ url: document.URL, label: "View Clan" }];
                    presence.setActivity(presenceData);
                });
        } else if (document.URL.includes("/upload")) {
            presenceData.largeImageKey = "https://i.imgur.com/v10pkZA.png";
            presenceData.smallImageKey = "https://i.imgur.com/55dCzB1.png";
            presenceData.details = "Uploading a post";
            presenceData.state = "";
            presence.setActivity(presenceData);
        } else if (document.URL.includes("/u/")) {
            const UserName = document.URL.split("/u/")[1];
            presenceData.largeImageKey = "https://api.dicebear.com/7.x/avataaars/png"; //`https://i.imgur.com/v10pkZA.png`;
            presenceData.smallImageKey = "https://i.imgur.com/v10pkZA.png";
            presenceData.details = "Viewing a user profile";
            presenceData.state = `@${UserName}`;
            presenceData.buttons = [{ url: document.URL, label: "View User" }];
            presence.setActivity(presenceData);
        } else presence.setActivity(presenceData);
        url = nurl;
    }
});
