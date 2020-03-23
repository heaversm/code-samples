namespace com.instrument {
	
	using TrueRealitySDK.Core;    
    using TrueRealitySDK.Core.Media;
    using TrueRealitySDK.Core.Data;
    using TrueRealitySDK.Core.Scoreboard;    
    using System;
    using System.Collections;
    using System.Collections.Generic;
    using System.IO;
    using UnityEngine;
    using UnityEngine.UI;
    using UnityEngine.SceneManagement;
    using UnityEngine.U2D;
    using DG.Tweening;
    using TMPro;
    using Debug = TrueRealitySDK.Core.Debug;

    [System.Serializable]
    public class TeamData
    {
        public List<Team> teams = new List<Team>();
    }

    [System.Serializable]
    public class Team
    {
        public List<string> colors;
        public string id;
        public string teamName;
    }

    public class GeminiScoreboard : GeminiSceneComponent, IScoreboardView {

        // scoreboard state
        private bool isMetadataSynced = false;
        private float timeLastMetadataSynced = 0;
        private bool isScoreboardVisible = true;

        // team data
        private string teamDataFile = "_Gemini/Data/teamsData.json";
        private TeamData teamData;
        private Team team1Data;
        private Team team2Data;
        private bool isTeamDataSet = false;

        // fade in/out timing values
        [SerializeField] private float fadeDuration;
        [SerializeField] private float fadeMovementYDistance;

        // scoreboard elements
        [SerializeField] private GameObject scoreboardUI;
        [SerializeField] private CanvasGroup scoreboardCanvasGroup;
        [SerializeField] private TextMeshProUGUI gamePeriodText;
        [SerializeField] private TextMeshProUGUI gameClockTimeText;
        [SerializeField] private TextMeshProUGUI possessionClockTimeText;
        [SerializeField] private SpriteAtlas logoSprites;

        [SerializeField] private Image awayTeamBGImage;
        [SerializeField] private Image awayTeamLogoImage;
        [SerializeField] private TextMeshProUGUI awayTeamScoreText;
        [SerializeField] private TextMeshProUGUI awayTeamFoulsText;
        [SerializeField] private TextMeshProUGUI awayTeamNameText;

        [SerializeField] private Image homeTeamBGImage;
        [SerializeField] private Image homeTeamLogoImage;
        [SerializeField] private TextMeshProUGUI homeTeamScoreText;
        [SerializeField] private TextMeshProUGUI homeTeamFoulsText;
        [SerializeField] private TextMeshProUGUI homeTeamNameText;

        // misc state
        private Vector3 scoreboardPosOrig;
        private float timeLastRefreshed = 0f;

        // -------

        // scoreboard displayed state
        [SerializeField] private string gamePeriod;
        [SerializeField] private int gameClockMinutes;
        [SerializeField] private int gameClockSeconds;
        [SerializeField] private int possessionClockSeconds;
        [SerializeField] private string awayTeamName;
        [SerializeField] private int awayTeamScore;
        [SerializeField] private int awayTeamNumWins;
        [SerializeField] private int awayTeamNumLosses;
        [SerializeField] private int awayTeamNumFouls;
        [SerializeField] private bool awayTeamInBonus;
        [SerializeField] private string homeTeamName;
        [SerializeField] private int homeTeamScore;
        [SerializeField] private int homeTeamNumWins;
        [SerializeField] private int homeTeamNumLosses;
        [SerializeField] private int homeTeamNumFouls;
        [SerializeField] private bool homeTeamInBonus;

       

        public override void Init(ITRSceneManager inSceneManager, ITREventManager inEventManager) {

            base.Init(inSceneManager, inEventManager);

            loadTeamData();

            scoreboardPosOrig = scoreboardUI.transform.position;

            // at start, hide the scoreboard
            fadeScoreboard(0f, 0f);
        }

        // Called from SceneComponent.Init()
        protected override void RegisterEventListeners() {

            // event when metadata is updated
            // obsolete -- DataService now calls UpdateScoreboard() via IScoreboardView
            //eventManager.RegisterEventListener(eventManager.videoProcMetadataEventId, this);

            // playhead events that means our metadata is temporarily out of sync
            eventManager.RegisterEventListener(eventManager.videoNextEventId, this);
            eventManager.RegisterEventListener(eventManager.videoPrevEventId, this);
            eventManager.RegisterEventListener(eventManager.videoFastForwardEventId, this);
            eventManager.RegisterEventListener(eventManager.videoRewindEventId, this);
            eventManager.RegisterEventListener(eventManager.videoSeekEventId, this);
            eventManager.RegisterEventListener(eventManager.videoSwitchEventId, this);
        }

		public override void OnEventReceived(string id, EventArgs args, ISceneComponent sender) {
            Debug.Log(Time.time+ " GeminiScoreboard OnEventReceived " +id);

            /* obsolete
            if (id.Equals(eventManager.videoProcMetadataEventId) && sender!=null) {
                IMetadataController metadataController = (IMetadataController)sender;
                IMetadataModel metadataModel = metadataController.GetDataModel();
                IBasketballMetadataModel basketballMetadataModel = (IBasketballMetadataModel)metadataModel;
                isMetadataSynced = true;                
                timeLastMetadataSynced = Time.time;
                updateScoreboardData(basketballMetadataModel);

            } else 
            */
            // if we're here, it's a playhead event that means our metadata is temporarily out of sync
            {
                isMetadataSynced = false;
            }
        }


        // Called from DataService via IScoreboardView
        public void UpdateScoreboard(IMetadataModel model)
        {
            Debug.Log(Time.time+ " GeminiScoreboard UpdateScoreboard");
            IBasketballMetadataModel basketballMetadataModel = (IBasketballMetadataModel)model;
            isMetadataSynced = true;
            timeLastMetadataSynced = Time.time;
            updateScoreboardData(basketballMetadataModel);
        }

        public void ResetScoreboard()
        {
            Debug.Log(Time.time+ " GeminiScoreboard ResetScoreboard");
        }

        // Called from DataService via IScoreboardView - ignore, since we custom-control the scoreboard game object
        public void Destroy()
        {
            //Destroy(gameObject);
        }
        public void Hide()
        {
            //gameObject.SetActive(false);
        }
        public void Show()
        {
            //gameObject.SetActive(true);
        }
        


        public void Update() {

            // placeholder: regularly refresh scoreboard every 1 seconds
            if (Time.time > timeLastRefreshed + 1f) {
                timeLastRefreshed = Time.time;

                // placeholder: fake game value updates
                placeholderGameValueUpdates();

                updateScoreboardUI();
            }

            // fade in scoreboard, once we have metadata to set the teams
            if (!isScoreboardVisible && isMetadataSynced && Time.time - timeLastMetadataSynced > 1f) {
                fadeScoreboard(1f, fadeDuration);
            }

        }


        private void updateScoreboardData(IBasketballMetadataModel basketballMetadataModel) {
            Debug.Log(Time.time+ " UpdateScoreboardData");

            if (!isTeamDataSet){
                setTeamData(basketballMetadataModel.HomeTeamID, basketballMetadataModel.AwayTeamID);
            }

            string awayTeamName = basketballMetadataModel.AwayTeamName;
            awayTeamScore = basketballMetadataModel.AwayTeamScore;
            awayTeamNumFouls = basketballMetadataModel.AwayTeamFouls;

            string homeTeamName = basketballMetadataModel.HomeTeamName;
            homeTeamScore = basketballMetadataModel.HomeTeamScore;
            homeTeamNumFouls = basketballMetadataModel.HomeTeamFouls;

            gamePeriod = basketballMetadataModel.Period;

            Debug.Log(
                awayTeamName+ " " +awayTeamScore+ " (fouls: " +awayTeamNumFouls+ ") "+
                "vs. " +
                homeTeamName+ " " +homeTeamScore+ " (fouls: " +homeTeamNumFouls+ ") "+
                "period " +gamePeriod
            );

            updateScoreboardUI();
        }


        private void updateScoreboardUI() {
            //Debug.Log(Time.time+ " UpdateScoreboardUI");
            
            if (isMetadataSynced) {
                gamePeriodText.text = string.Format("{0}", gamePeriod);
                awayTeamScoreText.text = string.Format("{0}", awayTeamScore);
                awayTeamFoulsText.text = string.Format("FOULS: {0}", awayTeamNumFouls);
                homeTeamScoreText.text = string.Format("{0}", homeTeamScore);
                homeTeamFoulsText.text = string.Format("FOULS: {0}", homeTeamNumFouls);

                if (gamePeriod.Equals("1") || gamePeriod.Equals("2") || 
                        gamePeriod.Equals("3") || gamePeriod.Equals("4")) {
                    gameClockTimeText.text = string.Format("{0}:{1:D2}", gameClockMinutes, gameClockSeconds);
                    possessionClockTimeText.text = string.Format("{0}", possessionClockSeconds);
                } else {
                    gameClockTimeText.text = "";
                    possessionClockTimeText.text = "";
                }

            } else {
                gamePeriodText.text = "";
                gameClockTimeText.text = "";
                possessionClockTimeText.text = "";
                awayTeamScoreText.text = "";
                awayTeamFoulsText.text = "";
                homeTeamScoreText.text = "";
                homeTeamFoulsText.text = "";
            }
        }

        private void loadTeamData(){
            
            Debug.Log(Application.dataPath);
            string filePath = Path.Combine(Application.dataPath, teamDataFile);
            if (File.Exists(filePath))
            {
                string dataAsJson = File.ReadAllText(filePath);
                teamData = JsonUtility.FromJson<TeamData>(dataAsJson);
            }
            else
            {
                Debug.LogError("GeminiScoreboard cannot load game data!");
            }
        }


        private void setTeamData(string homeTeamID, string awayTeamID){

            foreach(Team thisTeam in teamData.teams){

                if (thisTeam.id == homeTeamID){
                    homeTeamBGImage.color = convertColorString(thisTeam.colors[0]);
                    homeTeamLogoImage.sprite = logoSprites.GetSprite(thisTeam.id.ToLower());
                    homeTeamLogoImage.preserveAspect = true;
                    homeTeamNameText.text = thisTeam.teamName;

                } else if (thisTeam.id == awayTeamID){
                    awayTeamBGImage.color = convertColorString(thisTeam.colors[0]);
                    awayTeamLogoImage.sprite = logoSprites.GetSprite(thisTeam.id.ToLower());
                    awayTeamLogoImage.preserveAspect = true;
                    awayTeamNameText.text = thisTeam.teamName;
                }
            }

            isTeamDataSet = true;
        }


        private Color32 convertColorString(string thisColor){
            thisColor = thisColor.Trim();
            byte[] color = Array.ConvertAll(thisColor.Split(','), byte.Parse);
            return new Color32(color[0], color[1], color[2], 255);
        }


        private void fadeScoreboard(float fadeToVal, float fadeDur) {
            isScoreboardVisible = (fadeToVal>0f);

            if (fadeToVal==1f) Debug.Log(Time.time+ " Fading scoreboard in");
            else Debug.Log(Time.time+ " Fading scoreboard out");

            // fade scoreboard alpha in/out
            scoreboardCanvasGroup.DOFade(fadeToVal, fadeDur);

            // move scoreboard up/down
            Vector3 moveToPos = scoreboardPosOrig;
            if (fadeToVal==0f) {
                moveToPos.y -= fadeMovementYDistance;
            }
            scoreboardUI.transform.DOMove(moveToPos, fadeDur);
        }


        // placeholder: fake game value updates
        private void placeholderGameValueUpdates() {

                // placeholder: manually decrement game time
                gameClockSeconds -= 1;
                if (gameClockSeconds < 0) {

                    gameClockMinutes -= 1;
                    if (gameClockMinutes < 0) {
                        gameClockMinutes = 0;
                        gameClockSeconds = 0;
                                            
                    } else {
                        gameClockSeconds = 59;                    
                    }
                }

                // placeholder: manually decrement possession time
                possessionClockSeconds -= 1;
                if (possessionClockSeconds < 0) {
                    possessionClockSeconds = 0;
                }


                // placeholder: random occasional score increment, reset possession clock
                if (UnityEngine.Random.Range(0, 15) == 0) {

                    /* Now getting real metadata
                    if (UnityEngine.Random.Range(0, 2) == 0) {
                        awayTeamScore += UnityEngine.Random.Range(2, 4);
                    } else {
                        homeTeamScore += UnityEngine.Random.Range(2, 4);
                    }
                    */

                    possessionClockSeconds = 24;
                }
        }


	}
}


