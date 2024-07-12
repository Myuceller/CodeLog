<template>
  <div id="homeview">
    <div class="title">"임시" 게임목록</div>
    <div>
      this site is for searching the games.
    </div>
    <div>
      the games are from
      <a href="https://boardgamegeek.com/collection/user/boardgamehaja" style="size:20px; color:red">  HERE</a>
    </div>
    <div v-for="(game,i) in games" :key="i" class="gamecard">
      <img :src="game.image" alt="" class="img">
      {{ game }}
    </div>
    <!-- Uncomment and use if you want to display game cards
    <div class="home" v-for="(game, i) in games" :key="i" :class="gamecard">
      <img :src="game.image" alt="" class="img">
      {{ game }}
    </div>
    -->
    <!-- <div id="app">
      <input
        type="text"
        v-model="gameInput"
        placeholder="게임 이름을 입력하세요..."
        @input="submitAutoComplete"
        class="autocomplete"
        id="searchBox"
        autocomplete="off"
        v-on:input="typing"
      />
      <div class="autocomplete search" v-if="result.length && gameInput">
        <div v-for="(res, i) in result" :key="i" class="searchItem">{{ res.name }}</div>
      </div>
    </div> -->
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: 'HomeView',
  data() {
    return {
      gameInput: '',
      search: false,
      games: [],
      result: []
    };
  },
  methods: {
    getdatas() {
      axios.get("https://bgg-json.azurewebsites.net/collection/boardgamehaja")
        .then(res => {
          console.log(res);
          this.games = res.data;
        })
        .catch(error => {
          console.error(error);
        });
    },
    submitAutoComplete() {
      if (this.gameInput) {
        this.result = this.games.filter(game => 
          game.name.toLowerCase().includes(this.gameInput.toLowerCase())
        );
      } else {
        this.result = [];
      }
    },
    typing(e){
      this.gameInput = e.target.value;
    },
  },
  watch: {
    gameInput(newVal) {
      this.search = newVal !== '';
    }
  },
  mounted() {
    this.getdatas();
  }
};
</script>

<style scoped>
  .gamecard{
    
  }
  img{
    width: 200px;
    height: 200px;
  }
</style>