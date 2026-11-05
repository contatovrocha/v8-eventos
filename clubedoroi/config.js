/*
  Configuração do backend.
  - Vazio  => modo demonstração: dados ficam no navegador (localStorage), com contas de teste.
  - Preenchido => usa o Supabase (banco real, login real, isolamento por RLS).
    1) Rode supabase/schema.sql no SQL Editor do projeto Supabase.
    2) Cole aqui a Project URL e a chave publishable/anon (é pública por natureza; a segurança vem do RLS).
*/
window.CDR_CONFIG = {
  supabaseUrl: "",
  supabaseAnonKey: ""
};
