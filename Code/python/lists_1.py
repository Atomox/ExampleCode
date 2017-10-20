def list_cmd(l, args):
  arg = args[0]
  b = int(args[1]) if len(args) > 1 else None;
  c = int(args[2]) if len(args) > 2 else None;

  if arg == 'insert':
    l.insert(b,c)
  elif arg == 'append':
     l.append(b)
  elif arg == 'remove':
    l.remove(b)
  elif arg == 'pop':
    l.pop()
  elif arg == 'sort':
    l.sort()
  elif arg == 'reverse':
    l.reverse()
  elif arg == 'print':
    print(l)

if __name__ == '__main__':
    N = int(input())
    l = [];
    for i in range(0,N):
      inp = input().split(' ')
      list_cmd(l, inp)
