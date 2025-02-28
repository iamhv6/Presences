const presence = new Presence({
		clientId: "1161544315105976342",
	}),
	browsingTimestamp = Math.floor(Date.now() / 1000);
const enum Assets {
	Logo = "https://i.imgur.com/vosdvpf.jpg", //The main logo of the site
	Avatar = "https://i.imgur.com/b1B6qKC.png", //The avatar of the user will be using DOM in future
	SmallImg = "https://i.imgur.com/BIovjJj.png", //The thumbnail basically
}
async function postGQLAPI(
	operationName: string,
	query: string,
	vars: Record<string, unknown>
) {
	const response = await fetch("https://api.spyke.social/graphql", {
		method: "POST",
		headers: {
			authorization: `Bearer ${JSON.parse(
				JSON.parse(localStorage.getItem("persist:Token_Data_Persist"))
					.jwtIdToken
			)}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			query,
			variables: vars,
			operationName,
		}),
	});
	return response.json();
}
let url = "https://spyke.social/";
presence.on("UpdateData", async () => {
	const nurl = document.location.href;
	if (nurl !== url) {
		const presenceData: PresenceData = {
			largeImageKey: Assets.Logo,
			smallImageKey: Assets.SmallImg,
			details: "A Community Discussion Platform",
			state: "On Homepage",
			startTimestamp: browsingTimestamp,
		};
		if (document.location.href.includes("/p/")) {
			const res = await postGQLAPI(
				"presencepst",
				"query presencepst($id: ID!) { comments(ids: [$id]) { ... on Post { title content { id data __typename } communities { name dp } } } }",
				{ id: document.location.href.split("/p/")[1] }
			);
			if (res.data.comments[0].content[0].__typename === "Image") {
				presenceData.largeImageKey = res.data.comments[0].content[0].data;
				presenceData.smallImageKey = res.data.comments[0].communities[0].dp;
				presenceData.details = `Reading post in ${res.data.comments[0].communities[0].name}`;
				presenceData.state = res.data.comments[0].title;
				presenceData.buttons = [
					{ url: document.location.href, label: "View Post" },
				];
				presence.setActivity(presenceData);
			} else {
				presenceData.largeImageKey = res.data.comments[0].communities[0].dp;
				presenceData.smallImageKey = Assets.SmallImg;
				presenceData.details = `Reading post in ${res.data.comments[0].communities[0].name}`;
				presenceData.state = res.data.comments[0].title;
				presenceData.buttons = [
					{ url: document.location.href, label: "View Post" },
				];
				presence.setActivity(presenceData);
			}
		} else if (document.location.href.includes("/g/")) {
			const res = await postGQLAPI(
				"presencegrp",
				"query presencegrp($name:String!){ communityByName(name:$name) { name dp cover}}",
				{ name: document.location.href.split("/g/")[1] }
			);
			presenceData.largeImageKey = res.data.communityByName.cover;
			presenceData.smallImageKey = res.data.communityByName.dp;
			presenceData.state = res.data.communityByName.name;
			presenceData.details = "Viewing a Clan";
			presenceData.buttons = [
				{ url: document.location.href, label: "View Clan" },
			];
			presence.setActivity(presenceData);
		} else if (document.location.href.includes("/upload")) {
			presenceData.largeImageKey = Assets.Logo;
			presenceData.smallImageKey = Assets.SmallImg;
			presenceData.details = "Uploading a post";
			delete presenceData.state;
			presence.setActivity(presenceData);
		} else if (document.location.href.includes("/u/")) {
			presenceData.largeImageKey = Assets.Avatar;
			presenceData.smallImageKey = Assets.SmallImg;
			presenceData.details = "Viewing a user profile";
			presenceData.state = `@${document.location.href.split("/u/")[1]}`;
			presenceData.buttons = [
				{ url: document.location.href, label: "View User" },
			];
			presence.setActivity(presenceData);
		} else presence.setActivity(presenceData);
		url = nurl;
	}
});
