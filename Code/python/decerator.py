# https://www.hackerrank.com/challenges/standardize-mobile-number-using-decorators

# Wrap sort phone in a decorator, and format phone numbers in a standard format.
def wrapper(f):
    def fun(l):

        list = '';

        # Get to a standard input.
        for i in range(0,len(l)):
          if l[i][:1] == '+':
            l[i] = l[i][1:]
          if l[i][:2] == '91' and len(l[i]) > 10:
            l[i] = l[i][2:]
          elif l[i][:1] == '0' and len(l[i]) > 10:
            l[i] = l[i][1:]

        # Format the expected result.
        for i in range(0,len(l)):
          l[i] = '+91 ' + l[i][0:5] + ' ' + l[i][5:]

        # Apply the sort.
        return f(l)

    return fun


@wrapper
def sort_phone(l):
    print(*sorted(l), sep='\n')

if __name__ == '__main__':
    l = [input() for _ in range(int(input()))]
    sort_phone(l)