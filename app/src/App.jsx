import { useState } from 'react'

const COMMANDES = [
  { id: 'build', commande: 'docker build -t memo-docker:1.0 .', role: "Construit l'image à partir du Dockerfile" },
  { id: 'images', commande: 'docker images memo-docker', role: 'Liste les images locales et leur taille' },
  { id: 'run', commande: 'docker run -d --name memo -p 9090:8080 memo-docker:1.0', role: 'Lance un conteneur (port hôte : port conteneur)' },
  { id: 'ps', commande: 'docker ps', role: 'Affiche les conteneurs actifs' },
  { id: 'logs', commande: 'docker logs memo', role: 'Affiche les journaux du conteneur' },
  { id: 'stop', commande: 'docker stop memo && docker rm memo', role: 'Arrête puis supprime le conteneur' },
]

export default function App() {
  const [faites, setFaites] = useState(() => new Set())

  function basculer(id) {
    setFaites((precedentes) => {
      const suivantes = new Set(precedentes)
      if (suivantes.has(id)) {
        suivantes.delete(id)
      } else {
        suivantes.add(id)
      }
      return suivantes
    })
  }

  return (
    <main>
      <h1>Mémo Docker</h1>
      <p className="intro">
        Cette page est construite par Node, puis servie par Nginx depuis une image multi-stage.
      </p>

      <p className="progression" aria-live="polite">
        {faites.size} / {COMMANDES.length} commandes essayées
      </p>

      <ul>
        {COMMANDES.map(({ id, commande, role }) => (
          <li key={id}>
            <label>
              <input type="checkbox" checked={faites.has(id)} onChange={() => basculer(id)} />
              <span>
                <code>{commande}</code>
                <small>{role}</small>
              </span>
            </label>
          </li>
        ))}
      </ul>
    </main>
  )
}
