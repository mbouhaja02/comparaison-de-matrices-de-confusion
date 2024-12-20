from sklearn import datasets, model_selection, metrics
from sklearn.svm import LinearSVC
from sklearn.naive_bayes import GaussianNB
from sklearn.neighbors import KNeighborsClassifier
from sklearn.tree import DecisionTreeClassifier

import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.svm import SVC

# Adds higher directory to python modules path
import sys
sys.path.append(".")
sys.path.append("..")
from lib import make_json

### This file tests the functions: test_confusion_matrices - matrices_to_json - predictions_list_to_json - predictions_numpy_to_json

def generate_data_from_predictions_numpy(): # GENERATES DATA 1
    print("Generating confusion matrices for Handwritten Number Detection dataset...")
    digits = datasets.load_digits()
    X = digits.data
    y = digits.target
    X_train, X_test, y_train, y_test = model_selection.train_test_split(X, y, test_size=0.25, random_state=0)
    
    model_predictions = {"verite": y_test}

    for Model in [LinearSVC, GaussianNB, KNeighborsClassifier, DecisionTreeClassifier]:
        clf = Model().fit(X_train, y_train)
        y_pred = clf.predict(X_test)
        print('%s: %s' % (Model.__name__, metrics.f1_score(y_test, y_pred, average="macro")))
        model_predictions[Model.__name__] = y_pred

    class_names = digits.target_names

    # Use predictions_numpy_to_json function to save the confusion matrices and class names to a JSON file
    make_json.predictions_numpy_to_json(class_names, model_predictions, '../json/data_1.json')
    
def generate_data_from_predictions_list(): # GENERATES DATA 1
    print("Generating confusion matrices for Handwritten Number Detection dataset...")
    digits = datasets.load_digits()
    X = digits.data
    y = digits.target
    X_train, X_test, y_train, y_test = model_selection.train_test_split(X, y, test_size=0.25, random_state=0)

    # Convert numpy array to list for json serialization
    model_predictions = {"verite": y_test.tolist()}

    for Model in [LinearSVC, GaussianNB, KNeighborsClassifier, DecisionTreeClassifier]:
        clf = Model().fit(X_train, y_train)
        y_pred = clf.predict(X_test)
        print('%s: %s' % (Model.__name__, metrics.f1_score(y_test, y_pred, average="macro")))
        # Convert numpy array to list for json serialization
        model_predictions[Model.__name__] = y_pred.tolist()

    # Convert numpy array to list for json serialization
    class_names = digits.target_names.tolist()

    # Use predictions_list_to_json function to save the confusion matrices and class names to a JSON file
    make_json.predictions_list_to_json(class_names, model_predictions, '../json/data_1.json')

def generate_data_from_predictions_list2(): # !!! takes some time GENERATES DATA 2
    print("Generating confusion matrices for Credit Card Fraud Detection dataset...")
    data = pd.read_csv('../datasets/creditcard.csv')

    # Prepare the data
    X = data.drop('Class', axis=1)
    y = data['Class']
    X_train, X_test, y_train, y_test = model_selection.train_test_split(X, y, test_size=0.25, random_state=0)

    # Convert numpy array to list for json serialization
    model_predictions = {"verite": y_test.tolist()}

    for Model in [LogisticRegression, DecisionTreeClassifier, RandomForestClassifier, KNeighborsClassifier, MLPClassifier, SVC]:
        clf = Model().fit(X_train, y_train)
        y_pred = clf.predict(X_test)
        print('%s: %s' % (Model.__name__, metrics.f1_score(y_test, y_pred, average="macro")))
        # Convert numpy array to list for json serialization
        model_predictions[Model.__name__] = y_pred.tolist()

    # Use predictions_list_to_json function to save the confusion matrices and class names to a JSON file
    make_json.predictions_list_to_json(y.unique().tolist(), model_predictions, '../json/data_2.json')
    
    
def main():
    generate_data_from_predictions_numpy()
    generate_data_from_predictions_list()

if __name__ == "__main__":
    main()