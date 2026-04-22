// Cargar variables de entorno ANTES de importar prisma
import 'dotenv/config'

import prisma from '../src/lib/prisma'
import bcrypt from 'bcryptjs'

// Script de seed para poblar la base de datos con datos iniciales
// Se ejecuta con: npm run seed
// IDEMPOTENTE: puede ejecutarse múltiples veces sin duplicar datos

// Función auxiliar para calcular la dificultad basada en caracteres especiales
function calculateDifficulty(code: string): 'EASY' | 'MEDIUM' | 'HARD' {
  // Contamos caracteres especiales comunes en programación
  const specialChars = (code.match(/[{}()\[\];=><$@#!]/g) || []).length
  const ratio = (specialChars / code.length) * 100

  if (ratio < 15) return 'EASY'
  if (ratio <= 30) return 'MEDIUM'
  return 'HARD'
}

async function main() {
  console.log('Iniciando seed de la base de datos...')

  // ─── PASO 1: Lenguajes de programación ─────────────────────────────────────

  console.log('\n[1/4] Creando lenguajes...')

  const python = await prisma.language.upsert({
    where: { slug: 'python' },
    update: {},
    create: {
      name: 'Python',
      slug: 'python',
      icon: '🐍',
    },
  })

  const typescript = await prisma.language.upsert({
    where: { slug: 'typescript' },
    update: {},
    create: {
      name: 'TypeScript',
      slug: 'typescript',
      icon: '🔷',
    },
  })

  const javascript = await prisma.language.upsert({
    where: { slug: 'javascript' },
    update: {},
    create: {
      name: 'JavaScript',
      slug: 'javascript',
      icon: '🟨',
    },
  })

  const java = await prisma.language.upsert({
    where: { slug: 'java' },
    update: {},
    create: {
      name: 'Java',
      slug: 'java',
      icon: '☕',
    },
  })

  console.log(`Lenguajes creados: Python, TypeScript, JavaScript, Java`)

  // ─── PASO 2: Snippets de código real ───────────────────────────────────────

  console.log('\n[2/4] Creando snippets de código...')

  const snippets = [
    // PYTHON (4 snippets)
    {
      languageId: python.id,
      code: `def fibonacci(n: int) -> int:
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

result = fibonacci(10)
print(f"Fibonacci(10) = {result}")`,
      tags: ['recursion', 'type-hints', 'fibonacci'],
    },
    {
      languageId: python.id,
      code: `numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
squared_evens = [x**2 for x in numbers if x % 2 == 0]
filtered = list(filter(lambda x: x > 20, squared_evens))
print(filtered)`,
      tags: ['list-comprehension', 'lambda', 'filter'],
    },
    {
      languageId: python.id,
      code: `import time
from functools import wraps

def timer(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        end = time.time()
        print(f"{func.__name__} took {end - start:.4f}s")
        return result
    return wrapper`,
      tags: ['decorator', 'timing', 'functools'],
    },
    {
      languageId: python.id,
      code: `class FileManager:
    def __init__(self, filename):
        self.filename = filename
    
    def __enter__(self):
        self.file = open(self.filename, 'r')
        return self.file
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.file:
            self.file.close()`,
      tags: ['context-manager', 'classes', 'file-handling'],
    },

    // TYPESCRIPT (4 snippets)
    {
      languageId: typescript.id,
      code: `interface Repository<T extends { id: string }> {
  findById(id: string): Promise<T | null>;
  save(entity: T): Promise<T>;
}

async function getUser<T extends { id: string }>(
  repo: Repository<T>,
  id: string
): Promise<T | null> {
  return await repo.findById(id);
}`,
      tags: ['generics', 'interface', 'async'],
    },
    {
      languageId: typescript.id,
      code: `async function fetchUserData(userId: string): Promise<User> {
  try {
    const response = await fetch(\`/api/users/\${userId}\`);
    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }
    const data: User = await response.json();
    return data;
  } catch (error: unknown) {
    throw new Error(\`Failed to fetch user: \${error}\`);
  }
}`,
      tags: ['async-await', 'error-handling', 'fetch'],
    },
    {
      languageId: typescript.id,
      code: `const users = [
  { name: 'Alice', age: 25, active: true },
  { name: 'Bob', age: 30, active: false },
  { name: 'Charlie', age: 35, active: true }
];

const totalAge = users
  .filter(user => user.active)
  .map(user => user.age)
  .reduce((sum, age) => sum + age, 0);`,
      tags: ['array-methods', 'filter', 'map-reduce'],
    },
    {
      languageId: typescript.id,
      code: `interface Cat {
  type: 'cat';
  meow(): void;
}

interface Dog {
  type: 'dog';
  bark(): void;
}

function isCat(animal: Cat | Dog): animal is Cat {
  return animal.type === 'cat';
}`,
      tags: ['type-guard', 'interface', 'discriminated-union'],
    },

    // JAVASCRIPT (2 snippets)
    {
      languageId: javascript.id,
      code: `const fetchData = async () => {
  const [users, posts, comments] = await Promise.all([
    fetch('/api/users').then(r => r.json()),
    fetch('/api/posts').then(r => r.json()),
    fetch('/api/comments').then(r => r.json())
  ]);
  
  return { users, posts, comments };
};`,
      tags: ['promise-all', 'async', 'destructuring'],
    },
    {
      languageId: javascript.id,
      code: `function createCounter() {
  let count = 0;
  
  return {
    increment: () => ++count,
    decrement: () => --count,
    getCount: () => count,
    reset: () => { count = 0; }
  };
}

const counter = createCounter();`,
      tags: ['closure', 'encapsulation', 'private-variables'],
    },

    // JAVA (2 snippets)
    {
      languageId: java.id,
      code: `import java.util.ArrayList;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<String> names = new ArrayList<>();
        names.add("Alice");
        names.add("Bob");
        names.add("Charlie");
        
        names.forEach(name -> System.out.println("Hello, " + name));
    }
}`,
      tags: ['arraylist', 'lambda', 'foreach'],
    },
    {
      languageId: java.id,
      code: `import java.util.ArrayList;

public class Example {
    public static void main(String[] args) {
        ArrayList<Integer> numbers = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            numbers.add(i * 2);
        }
        
        for (int i = 0; i < numbers.size(); i++) {
            System.out.println(numbers.get(i));
        }
    }
}`,
      tags: ['for-loop', 'arraylist', 'indexing'],
    },
  ]

  // Insertamos cada snippet calculando su dificultad automáticamente
  let snippetCount = 0
  for (const snippet of snippets) {
    const difficulty = calculateDifficulty(snippet.code)
    const specialChars = (snippet.code.match(/[{}()\[\];=><$@#!]/g) || []).length
    const ratio = (specialChars / snippet.code.length) * 100

    await prisma.snippet.create({
      data: {
        languageId: snippet.languageId,
        code: snippet.code,
        difficulty,
        specialCharacters: ratio > 15,
        tags: snippet.tags,
        source: 'seed',
        isActive: true,
      },
    })
    snippetCount++
  }

  console.log(`Snippets creados: ${snippetCount}`)

  // ─── PASO 3: Usuario de prueba ─────────────────────────────────────────────

  console.log('\n[3/4] Creando usuario de prueba...')

  // Hasheamos la contraseña con bcrypt (12 rounds de salt)
  const hashedPassword = await bcrypt.hash('Test1234!', 12)

  const testUser = await prisma.user.upsert({
    where: { email: 'test@awos.dev' },
    update: {},
    create: {
      name: 'AWOS Tester',
      email: 'test@awos.dev',
      password: hashedPassword,
    },
  })

  console.log(`Usuario de prueba creado: ${testUser.email}`)

  // ─── PASO 4: Resumen final ─────────────────────────────────────────────────

  console.log('\n[4/4] Verificando datos insertados...')

  const languageCount = await prisma.language.count()
  const snippetCountFinal = await prisma.snippet.count()
  const userCount = await prisma.user.count()

  console.log('\n✅ Seed completado exitosamente:')
  console.log(`   - Lenguajes: ${languageCount}`)
  console.log(`   - Snippets: ${snippetCountFinal}`)
  console.log(`   - Usuarios: ${userCount}`)
  console.log('\nCredenciales de prueba:')
  console.log(`   Email: test@awos.dev`)
  console.log(`   Password: Test1234!`)
}

main()
  .catch((e) => {
    console.error('\n❌ Error ejecutando seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
