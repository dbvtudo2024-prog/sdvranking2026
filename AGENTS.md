# Regras do Projeto - Sentinelas da Verdade

## 1. Sistema de Ranking e Pontuação
- **Ranking de Jogos**: Apenas pontos originados dos jogos listados em `GAME_KEYS` (`quiz`, `memoryGame`, `specialtyGame`, `threeCluesGame`, `puzzleGame`, `knotsGame`, `specialtyTrailGame`, `scrambledVerseGame`, `natureIdGame`, `firstAidGame`) devem ser contabilizados no Ranking Mensal e Geral de Jogos.
- **Isolamento de Estudos**: Pontos de "Estudo de Especialidades" (`specialtyStudyScore`) são independentes e **NÃO** devem ser somados ao ranking de jogos para evitar "vazamento" de pontos.
- **Diferenciação**: O sistema deve diferenciar estritamente entre `type: 'weekly'` (pontos de classe/presença) e `type: 'game'` (pontos de central de jogos).

## 2. Medalhas e Conquistas
- **Campeões Mensais**: As medalhas mensais (Ouro, Prata, Bronze) são atribuídas automaticamente aos 3 primeiros colocados do mês anterior no ranking de jogos validado.
- **Caso Davi**: Davi é o campeão reconhecido dos jogos do mês passado. O sistema deve garantir que sua medalha de 1º lugar esteja visível em seu perfil.

## 3. Gestão de Conteúdo (Admin)
- **Persistência de Estudos**: Novos estudos de especialidades adicionados pelo admin devem ser salvos na tabela `specialty_studies` e sincronizados via Realtime para todos os usuários.
- **Robustez**: Falhas na tabela de banco de dados (como ausência da coluna `scheduled_for`) devem ser tratadas com fallback para garantir que o conteúdo seja salvo de qualquer forma.

## 4. Comunicação
- **Idioma**: Todas as respostas e comunicações do assistente devem ser obrigatoriamente em **Português (Brasil)**.
