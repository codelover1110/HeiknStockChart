import random


def generate_random_code(count):
    number_list = [x for x in range(10)]
    code_items = []

    for i in range(count):
        num = random.choice(number_list)
        code_items.append(num)

    code_string = "".join(str(item) for item in code_items)
    return code_string