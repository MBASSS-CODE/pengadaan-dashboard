<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1 class="login-title">Selamat Datang</h1>
        <p class="login-subtitle">Masuk ke Sistem Dashboard INAPROC</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="username" class="form-label">Username</label>
          <MazInput 
            id="username" 
            v-model="username" 
            type="text" 
            placeholder="Masukkan username" 
            required 
            block
          />
        </div>

        <div class="form-group">
          <label for="password" class="form-label">Password</label>
          <MazInput 
            id="password" 
            v-model="password" 
            type="password"
            placeholder="Masukkan password" 
            required 
            block
          />
        </div>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <MazBtn 
          type="submit" 
          class="submit-btn" 
          :loading="loading" 
          block
        >
          Masuk
        </MazBtn>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

definePageMeta({
  layout: 'blank',
});

const username = ref('');
const password = ref('');
const loading = ref(false);
const errorMessage = ref('');
const router = useRouter();

const handleLogin = async () => {
  loading.value = true;
  errorMessage.value = '';
  
  try {
    const response = await $fetch('/api/auth/login', {
      method: 'POST',
      body: {
        username: username.value,
        password: password.value
      }
    });

    if (response.success) {
      router.push('/');
    }
  } catch (error) {
    errorMessage.value = error.data?.statusMessage || 'Username atau password salah';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, hsl(var(--maz-primary) / 10%), hsl(var(--maz-secondary) / 10%));
  background-color: hsl(var(--maz-background));
  font-family: var(--maz-font-family, sans-serif);
  padding: 1rem;
}

.login-card {
  width: 100%;
  max-width: 420px;
  background: hsl(var(--maz-background));
  padding: 2.5rem;
  border-radius: 1.5rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
  border: 1px solid hsl(var(--maz-border));
  backdrop-filter: blur(10px);
  transform: translateY(0);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.login-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.12);
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-title {
  font-size: 2rem;
  font-weight: 700;
  color: hsl(var(--maz-foreground));
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.5px;
}

.login-subtitle {
  font-size: 0.95rem;
  color: hsl(var(--maz-muted));
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: hsl(var(--maz-foreground));
  margin-left: 0.25rem;
}

.error-message {
  color: hsl(var(--maz-destructive));
  font-size: 0.85rem;
  font-weight: 500;
  text-align: center;
  padding: 0.5rem;
  background: hsl(var(--maz-destructive) / 10%);
  border-radius: var(--maz-border-radius, 0.5rem);
}

.submit-btn {
  margin-top: 1rem;
  height: 48px;
  font-size: 1.05rem;
  font-weight: 600;
  letter-spacing: 0.5px;
}
</style>
