<template>
  <footer>
    <p>Leonardo Pinto - Copyright 2023</p>
    <div>
      <img src="../assets/github-logo.png" alt="github logo" />
      <img src="../assets/linkedin-logo.png" alt="linkedin logo" />
    </div>
  </footer>
</template>

<style scoped>
footer {
  background-color: #6366f1;
  align-items: center;
  bottom: 0;
  display: flex;
  justify-content: space-around;
  left: 0;
  position: fixed;
  width: 100%;
}

footer img {
  width: 1.5rem;
  height: 1.5rem;
}

footer p {
  color: white;
  font-size: 0.8rem;
}

footer div img {
  margin-left: 1rem;
}
</style>
